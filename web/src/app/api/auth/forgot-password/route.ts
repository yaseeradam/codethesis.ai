import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordResetToken } from '@/lib/db';

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

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated',
      token: resetData.token,
      resetUrl: `/auth/reset-password?token=${resetData.token}`,
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing password reset.' },
      { status: 500 }
    );
  }
}
