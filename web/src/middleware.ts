import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/tool',
  '/projects',
  '/settings',
  '/admin',
];

const SESSION_SECRET = process.env.JWT_SECRET || 'codethesis_super_secure_session_secret_2026';

async function verifySessionTokenEdge(token: string): Promise<{ role?: string; exp?: number; [key: string]: any } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Url, signature] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(base64Url));
    // Base64url encode without padding
    const bytes = new Uint8Array(sigBuf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (signature !== expectedSig) return null;

    // Decode base64url payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const payload = JSON.parse(atob(padded));

    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionCookie = request.cookies.get('codethesis_session');
  const token = sessionCookie?.value;
  const payload = token ? await verifySessionTokenEdge(token) : null;
  const isAuthenticated = Boolean(payload);

  // Redirect deprecated /studio to /tool/thesis
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    return NextResponse.redirect(new URL('/tool/thesis', request.url));
  }

  // Allow unauthenticated access to password recovery routes
  if (pathname.startsWith('/auth/forgot-password') || pathname.startsWith('/auth/reset-password')) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-Based Access Control: Protect /admin and /api/admin routes
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated || !payload) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || !payload) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'admin') {
      const dashUrl = new URL('/dashboard', request.url);
      dashUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(dashUrl);
    }
  }

  // If already authenticated and accessing login or register, redirect to dashboard unless ?switch=true
  if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
    if (!searchParams.get('switch')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/studio/:path*',
    '/tool/:path*',
    '/projects/:path*',
    '/settings/:path*',
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ],
};
