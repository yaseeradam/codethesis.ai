import { NextRequest, NextResponse } from 'next/server';
import {
  getTransactionByReference,
  updateTransactionByReference,
  updateUser,
  getUserById,
  logCreditEntry,
  createNotification
} from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const PLAN_CREDITS: Record<string, number> = {
  starter: 10,
  standard: 35,
  complete: 100,
  faculty: 500,
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 });
    }

    const tx = await getTransactionByReference(reference);
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.status === 'success') {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
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
    let paymentVerified = false;

    // 1. Live Verification if valid real key exists
    if (isLiveKey) {
      try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
          },
        });
        const data = await response.json();
        if (data.status && data.data?.status === 'success') {
          paymentVerified = true;
        }
      } catch (err) {
        console.error('Error verifying with Paystack API:', err);
      }
    } else {
      // Simulation / Test mode verification
      paymentVerified = true;
    }

    if (paymentVerified) {
      // Mark transaction successful
      const updatedTx = await updateTransactionByReference(reference, {
        status: 'success',
        paidAt: new Date().toISOString(),
      });

      // Credit the user
      const creditsToAdd = PLAN_CREDITS[tx.planId] || 15;
      const user = await getUserById(tx.userId);
      if (user) {
        const newBalance = (user.credits || 0) + creditsToAdd;
        await updateUser(user.id, {
          plan: tx.planId as any,
          credits: newBalance,
        });

        // Audit credit history
        await logCreditEntry({
          userId: user.id,
          amount: creditsToAdd,
          type: 'payment_topup',
          balanceAfter: newBalance,
          description: `Payment topup: ${tx.planId.toUpperCase()} package (+${creditsToAdd} credits)`,
        });

        // Push persistent notification
        await createNotification({
          userId: user.id,
          title: 'Credits Added Successfully',
          message: `Your payment was confirmed. ${creditsToAdd} academic generation credits have been added to your balance.`,
          type: 'payment',
          link: '/dashboard',
        });
      }

      return NextResponse.json({
        success: true,
        verified: true,
        plan: tx.planId,
        creditsAdded: creditsToAdd,
        transaction: updatedTx,
      });
    }

    return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification error' }, { status: 500 });
  }
}
