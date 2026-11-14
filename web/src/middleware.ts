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

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionCookie = request.cookies.get('codethesis_session');
  const isAuthenticated = Boolean(sessionCookie?.value);

  // Check if route is protected
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
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
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
