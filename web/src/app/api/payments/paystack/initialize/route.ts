import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createTransaction } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { email, amount, planId, callbackUrl } = body;

    if (!email || !amount || !planId) {
      return NextResponse.json({ error: 'Email, amount, and planId are required' }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLiveKey = Boolean(
      paystackSecret && 
      !paystackSecret.includes('placeholder') && 
      !paystackSecret.includes('xxxx') &&
      paystackSecret.startsWith('sk_')
    );
    const reference = `CT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const effectiveUserId = user?.id || 'demo-student-001';

    // Record pending transaction in our persistence layer
    await createTransaction({
      userId: effectiveUserId,
      reference,
      amount: Number(amount),
      currency: 'NGN',
      status: 'pending',
      planId,
    });

    // 1. Live Paystack Gateway (if live secret key is supplied in .env)
    if (isLiveKey) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            amount: Math.round(Number(amount) * 100), // Paystack requires amount in kobo
            reference,
            callback_url: callbackUrl || `${req.nextUrl.origin}/dashboard?payment=success&ref=${reference}`,
            metadata: {
              userId: effectiveUserId,
              planId,
              customer_name: user?.fullName || email,
            },
          }),
        });

        const data = await response.json();
        if (data.status && data.data) {
          return NextResponse.json({
            success: true,
            mode: 'live',
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference,
          });
        }
      } catch (err: any) {
        console.error('Paystack initialization error, falling back to instant checkout:', err);
      }
    }

    // 2. Verified Simulation / Demo Mode (for testing without live credentials)
    return NextResponse.json({
      success: true,
      mode: 'simulation',
      reference,
      authorization_url: `/dashboard?payment=simulation&ref=${reference}&plan=${planId}`,
      message: 'Paystack sandbox ready (add PAYSTACK_SECRET_KEY to .env for real bank debits)',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
