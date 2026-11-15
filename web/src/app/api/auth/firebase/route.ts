import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, User } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { email, fullName, photoURL, uid } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Firebase authentication requires a valid email.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user: User | null = await getUserByEmail(normalizedEmail);

    // If student doesn't exist yet, auto-provision account with 15 free starter credits
    if (!user) {
      try {
        user = await createUser({
          email: normalizedEmail,
          fullName: fullName?.trim() || normalizedEmail.split('@')[0],
          password: crypto.randomBytes(16).toString('hex'), // Secure random password
          matricNumber: 'GOOG/CSC/26/' + Math.floor(1000 + Math.random() * 9000),
          institution: normalizedEmail.includes('.edu')
            ? 'Institutional Scholar'
            : 'Federal University of Technology, Akure',
        });
      } catch (err: any) {
        // In case of race condition
        user = await getUserByEmail(normalizedEmail);
        if (!user) {
          throw err;
        }
      }
    }

    // Generate authenticated JWT session
    const token = createSessionToken(user);
    const { passwordHash, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${user.fullName}!`,
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
    console.error('Firebase Auth Sync Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Firebase session synchronization failed' },
      { status: 500 }
    );
  }
}
