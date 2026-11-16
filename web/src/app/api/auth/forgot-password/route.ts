import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordResetToken } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { email } = body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    const resetData = await createPasswordResetToken(cleanEmail);

    // Compute absolute URL for clickable email link
    const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';
    const absoluteResetUrl = `${origin}/auth/reset-password?token=${encodeURIComponent(resetData.token)}`;

    // Dispatch transactional email via Resend API
    const emailDispatch = await sendPasswordResetEmail({
      to: cleanEmail,
      resetUrl: absoluteResetUrl,
      userName: user.fullName,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been dispatched to your email address.',
      emailSent: emailDispatch.success,
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing password reset.' },
      { status: 500 }
    );
  }
}
