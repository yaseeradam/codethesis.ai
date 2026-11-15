import { NextRequest, NextResponse } from 'next/server';
import { verifyAndConsumeResetToken } from '@/lib/db';

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

    const { token, newPassword } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Password reset token is required.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const result = await verifyAndConsumeResetToken(token.trim(), newPassword);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to reset password.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated. You may now sign in.',
    });
  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing password reset.' },
      { status: 500 }
    );
  }
}
