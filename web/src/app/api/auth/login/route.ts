import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserById, verifyPassword, hashPassword, logAuthEvent } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';

const DEMO_EMAILS: Record<string, string[]> = {
  adebayo: ['student@futa.edu.ng', 'student@codethesis.ai'],
  ibrahim: ['imusa@futa.edu.ng'],
  chioma: ['cokeke@unilag.edu.ng'],
  admin: ['admin@codethesis.ai'],
};

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { email, password, demo } = body;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    // Handle 1-Click Fast Demo Login
    if (demo && typeof demo === 'string') {
      const candidates = DEMO_EMAILS[demo.toLowerCase()] || [demo];
      let user = null;
      for (const email of candidates) {
        user = await getUserByEmail(email);
        if (user) break;
      }
      const demoEmail = user?.email || candidates[0];

      if (!user) {
        await logAuthEvent({
          email: demoEmail,
          action: 'signin_failed',
          ip,
          userAgent,
          metadata: { demoRole: demo, reason: 'demo_user_not_found' },
        });

        return NextResponse.json(
          { success: false, error: 'Demo user account not found in database' },
          { status: 404 }
        );
      }

      await logAuthEvent({
        userId: user.id,
        email: user.email,
        action: 'signin_success',
        ip,
        userAgent,
        metadata: { demoRole: demo, loginType: 'demo' },
      });

      const token = createSessionToken(user);
      const { passwordHash, ...safeUser } = user;

      const response = NextResponse.json({
        success: true,
        message: `Welcome back, ${user.fullName}!`,
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
    }

    // Handle Standard Credential Login
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
