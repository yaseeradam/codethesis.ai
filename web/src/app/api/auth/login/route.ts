import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, logAuthEvent } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateCheck = await checkRateLimit({
      keyId: `login_attempt_${ip}`,
      limitPerMinute: 10,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please wait 1 minute before trying again.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 60) } }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { email, password } = body;
    const userAgent = req.headers.get('user-agent') || undefined;

    // Standard Real Credential Login
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both email and password' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(cleanEmail);
    if (!user) {
      await logAuthEvent({
        email: cleanEmail,
        action: 'signin_failed',
        ip,
        userAgent,
        metadata: { reason: 'user_not_found' },
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email address or password' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      await logAuthEvent({
        userId: user.id,
        email: user.email,
        action: 'signin_failed',
        ip,
        userAgent,
        metadata: { reason: 'invalid_password' },
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email address or password' },
        { status: 401 }
      );
    }

    await logAuthEvent({
      userId: user.id,
      email: user.email,
      action: 'signin_success',
      ip,
      userAgent,
      metadata: { loginType: 'credentials' },
    });

    const token = createSessionToken(user);
    const { passwordHash, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: safeUser,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication server error' },
      { status: 500 }
    );
  }
}
