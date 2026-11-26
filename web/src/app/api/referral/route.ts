import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { getUserById, getAllUsers, updateUser } from '@/lib/db';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let user = await getUserById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure user has a referral code
    if (!user.referralCode) {
      const generatedCode = `CT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      user = (await updateUser(user.id, { referralCode: generatedCode })) || user;
    }

    const referralCode = user.referralCode || '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thesis.academyhub.com.ng';

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink: `${baseUrl}/auth/register?ref=${referralCode}`,
      referralCount: user.referralCount || 0,
      referralEarnings: user.referralEarnings || 0,
      referredBy: user.referredBy || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load referral info' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const code = String(body.referralCode || '').trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: 'Please provide a valid referral code.' }, { status: 400 });
    }

    const user = await getUserById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.referredBy) {
      return NextResponse.json({ error: 'A referral code has already been applied to your account.' }, { status: 400 });
    }

    if (user.referralCode?.toUpperCase() === code) {
      return NextResponse.json({ error: 'You cannot use your own referral code.' }, { status: 400 });
    }

    const allUsers = await getAllUsers();
    const referrer = allUsers.find((u) => u.referralCode?.toUpperCase() === code);
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code. Please check and try again.' }, { status: 404 });
    }

    await updateUser(user.id, { referredBy: referrer.referralCode });
    await updateUser(referrer.id, { referralCount: (referrer.referralCount || 0) + 1 });

    return NextResponse.json({
      success: true,
      message: `Referral code ${referrer.referralCode} applied! Your referrer will earn 25% commission when you top up.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to redeem referral code' }, { status: 500 });
  }
}
