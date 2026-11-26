import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateTransactionByReference, updateUser, getUserById, getTransactionByReference, creditReferralCommission, sql, isNeonConfigured } from '@/lib/db';
import { resolvePlanCreditsAndPrice } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const bodyText = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // 1. Verify HMAC SHA512 signature if secret key is configured
    if (!paystackSecret || paystackSecret.includes('placeholder') || paystackSecret.includes('xxxx')) {
      return NextResponse.json({ error: 'Paystack secret key is not configured' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing Paystack signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha512', paystackSecret)
      .update(bodyText)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;
    const data = payload.data;

    // 2. Handle successful charge idempotently with atomic state transitions
    if (event === 'charge.success') {
      const reference = data.reference;
      const metadata = data.metadata || {};
      const planId = metadata.planId || 'starter';
      const userId = metadata.userId;

      const existingTx = await getTransactionByReference(reference);
      if (existingTx && existingTx.status === 'success') {
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }

      const planDetails = resolvePlanCreditsAndPrice(planId, metadata.credits || existingTx?.credits);
      const creditsToAdd = existingTx?.credits || metadata.credits || planDetails.credits || 25;

      if (isNeonConfigured()) {
        try {
          const rows = await sql`
            UPDATE transactions
            SET status = 'success', paid_at = NOW(), credits = ${creditsToAdd}
            WHERE reference = ${reference} AND status != 'success'
            RETURNING id;
          `;

          if (!rows || rows.length === 0) {
            // Already processed idempotently
            return NextResponse.json({ status: 'already_processed' }, { status: 200 });
          }

          if (userId) {
            const isAcademic = ['starter', 'scholar', 'postgrad', 'standard', 'complete', 'faculty'].includes(planId);
            if (isAcademic) {
              await sql`
                UPDATE users
                SET credits = credits + ${creditsToAdd}, plan = ${planId}
                WHERE id = ${userId};
              `;
            } else {
              await sql`
                UPDATE users
                SET credits = credits + ${creditsToAdd}
                WHERE id = ${userId};
              `;
            }
          }

          return NextResponse.json({ status: 'success' }, { status: 200 });
        } catch (dbErr) {
          console.error('Neon webhook fulfillment error, using fallback:', dbErr);
        }
      }

      // Fallback for local store
      if (existingTx) {
        await updateTransactionByReference(reference, {
          status: 'success',
          paidAt: new Date().toISOString(),
          credits: creditsToAdd,
        });
      }

      const effectiveUserId = userId || existingTx?.userId;
      if (effectiveUserId) {
        const user = await getUserById(effectiveUserId);
        if (user) {
          const isAcademic = ['starter', 'scholar', 'postgrad', 'standard', 'complete', 'faculty'].includes(planId);
          await updateUser(user.id, {
            ...(isAcademic ? { plan: planId as any } : {}),
            credits: (user.credits || 0) + creditsToAdd,
          });
          await creditReferralCommission(user.id, data.amount ? data.amount / 100 : 0).catch(() => {});
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
