import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createTransaction } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { resolvePlanCreditsAndPrice } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to initialize payment' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { planId, requestedCredits, callbackUrl } = body;

    // Resolve authoritative pricing & credit allocation
    const planDetails = resolvePlanCreditsAndPrice(planId, requestedCredits);
    const effectiveAmount = planDetails.priceNGN;
    const effectiveCredits = planDetails.credits;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLiveKey = Boolean(
      paystackSecret && 
      !paystackSecret.includes('placeholder') && 
      !paystackSecret.includes('xxxx') &&
      paystackSecret.startsWith('sk_')
    );

    // If Paystack is not properly configured with an active secret key, halt immediately.
    // Do NOT fall back to simulation or award free credits.
    if (!isLiveKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paystack payment gateway is awaiting administrator configuration. Please contact support or set PAYSTACK_SECRET_KEY in server environment to enable live payments.',
        },
        { status: 503 }
      );
    }

    const reference = `CT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Record pending transaction with exact credit entitlement
    await createTransaction({
      userId: user.id,
      reference,
      amount: effectiveAmount,
      currency: 'NGN',
      status: 'pending',
      planId: planDetails.planId,
      credits: effectiveCredits,
    });

    const defaultCallback = `${req.nextUrl.origin}/pricing?payment=return&reference=${reference}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(effectiveAmount * 100), // Paystack expects amount in kobo
        reference,
        callback_url: callbackUrl || defaultCallback,
        metadata: {
          userId: user.id,
          planId: planDetails.planId,
          credits: effectiveCredits,
          customer_name: user.fullName || user.email,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.status || !data.data?.authorization_url) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || 'Failed to initialize payment gateway. Please check card or bank connection.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference,
    });
  } catch (error: any) {
    console.error('Paystack initialize error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
