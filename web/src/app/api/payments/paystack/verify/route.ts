import { NextRequest, NextResponse } from 'next/server';
import {
  getTransactionByReference,
  updateTransactionByReference,
  updateUser,
  getUserById,
  logCreditEntry,
  createNotification,
  creditReferralCommission,
} from '@/lib/db';
import { resolvePlanCreditsAndPrice } from '@/lib/plans';

async function verifyAndCredit(reference: string) {
  if (!reference) {
    return NextResponse.json({ success: false, error: 'Transaction reference is required' }, { status: 400 });
  }

  const tx = await getTransactionByReference(reference);
  if (!tx) {
    return NextResponse.json({ success: false, error: 'Transaction reference not found in system' }, { status: 404 });
  }

  // Idempotent return if already credited
  if (tx.status === 'success') {
    const user = await getUserById(tx.userId);
    return NextResponse.json({
      success: true,
      alreadyProcessed: true,
      creditsAdded: tx.credits || 0,
      balance: user?.credits ?? 0,
      transaction: tx,
    });
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  const isLiveKey = Boolean(
    paystackSecret && 
    !paystackSecret.includes('placeholder') && 
    !paystackSecret.includes('xxxx') &&
    paystackSecret.startsWith('sk_')
  );

  // Require actual Paystack configuration; NEVER grant mock or free credits
  if (!isLiveKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Paystack secret key is unconfigured on server. Payment cannot be verified.',
      },
      { status: 503 }
    );
  }

  let paystackData: any = null;
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });
    paystackData = await response.json();
  } catch (err: any) {
    console.error('Paystack API call failure during verification:', err);
    return NextResponse.json(
      { success: false, error: 'Unable to reach Paystack verification servers. Please retry shortly.' },
      { status: 502 }
    );
  }

  if (!paystackData || !paystackData.status || paystackData.data?.status !== 'success') {
    return NextResponse.json(
      {
        success: false,
        error: `Payment unverified: Status is "${paystackData?.data?.status || 'failed'}". No credits have been granted.`,
      },
      { status: 400 }
    );
  }

  // Exact credit resolution
  const resolved = resolvePlanCreditsAndPrice(tx.planId, tx.credits);
  const creditsToAdd = tx.credits || resolved.credits || 25;

  // Mark transaction successful
  await updateTransactionByReference(reference, {
    status: 'success',
    paidAt: new Date().toISOString(),
    credits: creditsToAdd,
  });

  const user = await getUserById(tx.userId);
  let newBalance = creditsToAdd;

  if (user) {
    newBalance = (user.credits || 0) + creditsToAdd;
    const isAcademicPlan = ['starter', 'scholar', 'postgrad', 'standard', 'complete', 'faculty'].includes(tx.planId);
    
    await updateUser(user.id, {
      ...(isAcademicPlan ? { plan: tx.planId as any } : {}),
      credits: newBalance,
    });

    await logCreditEntry({
      userId: user.id,
      amount: creditsToAdd,
      type: 'payment_topup',
      balanceAfter: newBalance,
      description: `Verified Paystack purchase: ${resolved.name || tx.planId} (+${creditsToAdd} credits)`,
    });

    await createNotification({
      userId: user.id,
      title: 'Credits Added Successfully',
      message: `Your payment was confirmed. ${creditsToAdd} credits have been deposited to your account balance.`,
      type: 'payment',
      link: '/dashboard',
    });

    await creditReferralCommission(user.id, tx.amount || resolved.priceNGN || 0).catch((err) =>
      console.warn('Referral commission credit error:', err)
    );
  }

  return NextResponse.json({
    success: true,
    creditsAdded: creditsToAdd,
    balance: newBalance,
    planId: tx.planId,
    reference,
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference') || url.searchParams.get('trxref') || '';
    return await verifyAndCredit(reference);
  } catch (error: any) {
    console.error('Paystack GET verify error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const reference = body.reference || body.trxref || '';
    return await verifyAndCredit(reference);
  } catch (error: any) {
    console.error('Paystack POST verify error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}
