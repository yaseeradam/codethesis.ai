import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/studio',
  '/tool',
  '/projects',
  '/settings',
  '/admin',
];

function decodeSessionPayload(token: string): { role?: string; [key: string]: any } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const base64Url = parts[0];
    if (typeof Buffer !== 'undefined') {
      return JSON.parse(Buffer.from(base64Url, 'base64url').toString('utf-8'));
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionCookie = request.cookies.get('codethesis_session');
  const isAuthenticated = Boolean(sessionCookie?.value);

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

  // Role-Based Access Control: Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (isAuthenticated && sessionCookie?.value) {
      const payload = decodeSessionPayload(sessionCookie.value);
      if (!payload || payload.role !== 'admin') {
        const dashUrl = new URL('/dashboard', request.url);
        dashUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(dashUrl);
      }
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
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ],
};
