import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateTransactionByReference, updateUser, getUserById, getTransactionByReference } from '@/lib/db';

const PLAN_CREDITS: Record<string, number> = {
  starter: 10,
  standard: 35,
  complete: 100,
  faculty: 500,
  'dev-hacker': 100,
  'dev-growth': 750,
  'dev-startup': 3000,
  'dev-enterprise': 12000,
};

export async function POST(req: NextRequest) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const bodyText = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // 1. Verify HMAC SHA512 signature if secret key is configured
    if (paystackSecret && !paystackSecret.includes('placeholder')) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing Paystack signature' }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac('sha512', paystackSecret)
        .update(bodyText)
        .digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;
    const data = payload.data;

    // 2. Handle successful charge idempotently
    if (event === 'charge.success') {
      const reference = data.reference;
      const metadata = data.metadata || {};
      const planId = metadata.planId || 'standard';
      const userId = metadata.userId;

      const existingTx = await getTransactionByReference(reference);
      if (existingTx && existingTx.status === 'success') {
        // Idempotent: already fulfilled
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }

      if (existingTx) {
        await updateTransactionByReference(reference, {
          status: 'success',
          paidAt: new Date().toISOString(),
        });
      }

      if (userId) {
        const user = await getUserById(userId);
        if (user) {
          const creditsToAdd = PLAN_CREDITS[planId] || 15;
          await updateUser(user.id, {
            plan: planId as any,
            credits: (user.credits || 0) + creditsToAdd,
          });
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
