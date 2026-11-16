import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, logCreditEntry } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      fullName,
      email,
      password,
      matricNumber = '',
      institution = '',
      course = '',
    } = body as {
      fullName?: string;
      email?: string;
      password?: string;
      matricNumber?: string;
      institution?: string;
      course?: string;
    };

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      email,
      password,
      fullName,
      matricNumber,
      institution,
    });

    // Log the free starter credits given on signup
    await logCreditEntry({
      userId: newUser.id,
      amount: newUser.credits,
      type: 'signup_bonus',
      balanceAfter: newUser.credits,
      description: `Welcome bonus: ${newUser.credits} free academic credits granted on signup`,
    });

    // Asynchronously dispatch transactional welcome email via Resend
    sendWelcomeEmail({
      to: newUser.email,
      fullName: newUser.fullName,
      starterCredits: newUser.credits,
    }).catch((err) => console.warn('[Resend] Welcome email dispatch caught:', err));

    const token = createSessionToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome credits added.',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        matricNumber: newUser.matricNumber,
        institution: newUser.institution,
        plan: newUser.plan,
        credits: newUser.credits,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
