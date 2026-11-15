import crypto from 'crypto';
import { cookies } from 'next/headers';
import { User, getUserById } from './db';

const SESSION_SECRET = process.env.JWT_SECRET || 'codethesis_super_secure_session_secret_2026';
const COOKIE_NAME = 'codethesis_session';

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  plan: string;
  role: 'student' | 'admin';
  exp: number;
}

export function createSessionToken(user: User): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    plan: user.plan,
    role: user.role || 'student',
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );

    if (Date.now() > payload.exp) return null;

    return payload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session) return null;

    return await getUserById(session.userId);
  } catch {
    return null;
  }
}

export interface PasswordResetPayload {
  userId: string;
  email: string;
  exp: number;
}

export function createPasswordResetToken(user: { id: string; email: string }): string {
  const payload: PasswordResetPayload = {
    userId: user.id,
    email: user.email.toLowerCase(),
    exp: Date.now() + 1000 * 60 * 60, // 1 hour validity
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`pwd_reset:${payloadBase64}`)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifyPasswordResetToken(token: string): PasswordResetPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`pwd_reset:${payloadBase64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: PasswordResetPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );

    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
