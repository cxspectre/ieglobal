import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Dashboard subdomain: rewrite to /en/ paths so dashboard is served at dashboard.ie-global.net
  if (host.startsWith('dashboard.')) {
    const pathname = url.pathname;
    if (pathname === '/' || pathname === '') {
      url.pathname = '/en/dashboard';
      return NextResponse.rewrite(url);
    }
    if (!pathname.startsWith('/en/') && !pathname.startsWith('/de/')) {
      url.pathname = `/en${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except api, auth, _next, static files
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
};
