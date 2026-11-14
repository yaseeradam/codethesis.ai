import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserById, hashPassword } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';

const DEMO_EMAILS: Record<string, string> = {
  adebayo: 'student@futa.edu.ng',
  ibrahim: 'imusa@futa.edu.ng',
  chioma: 'cokeke@unilag.edu.ng',
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

    // Handle 1-Click Fast Demo Login
    if (demo && typeof demo === 'string') {
      const demoEmail = DEMO_EMAILS[demo.toLowerCase()] || 'student@futa.edu.ng';
      const user = await getUserByEmail(demoEmail);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Demo user account not found in database' },
          { status: 404 }
        );
      }

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

    const user = await getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address or password' },
        { status: 401 }
      );
    }

    const expectedHash = hashPassword(password);
    if (user.passwordHash !== expectedHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address or password' },
        { status: 401 }
      );
    }

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
