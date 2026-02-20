import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const TEMPLATE_EXCLUDED_SUBDOMAINS = ['www', 'dashboard', 'api'];

function isTemplateSubdomain(host: string): string | null {
  const baseDomain = (process.env.NEXT_PUBLIC_TEMPLATE_BASE_DOMAIN || 'templates.ie-global.net').toLowerCase();
  const h = host.toLowerCase();
  if (h === baseDomain || !h.endsWith(`.${baseDomain}`)) return null;
  const subdomain = h.split('.')[0];
  if (!subdomain || TEMPLATE_EXCLUDED_SUBDOMAINS.includes(subdomain)) return null;
  return subdomain;
}

export default function middleware(request: NextRequest) {
  // Vercel sets x-forwarded-host to the original requested host; host may be the internal host
  const rawHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('x-real-host') ||
    request.headers.get('host') ||
    '';
  const host = rawHost.split(':')[0].toLowerCase().trim();
  const url = request.nextUrl.clone();

  // Template preview route - bypass i18n (no locale prefix)
  if (url.pathname.startsWith('/templates/preview/')) {
    return NextResponse.next();
  }

  // Template subdomain (e.g. auraai.templates.ie-global.net) → serve template preview
  const templateSlug = isTemplateSubdomain(host);
  if (templateSlug) {
    const pathname = url.pathname === '/' ? '' : url.pathname;
    url.pathname = `/templates/preview/${templateSlug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Dashboard subdomain: rewrite to /en/ paths so dashboard is served at dashboard.ie-global.net
  if (host.startsWith('dashboard.')) {
    const pathname = url.pathname;
    // Let static assets (logo, images, etc.) be served from public/ — do not rewrite
    if (pathname.includes('.')) {
      return NextResponse.next();
    }
    if (pathname === '/' || pathname === '') {
      url.pathname = '/en/dashboard';
      return NextResponse.rewrite(url);
    }
    if (!pathname.startsWith('/en/') && !pathname.startsWith('/de/')) {
      url.pathname = `/en${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Main site: skip i18n for static assets (logo, images, etc.) so Next.js serves them from public
  if (url.pathname.includes('.')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except api, auth, _next - include paths with dots for template asset proxying
  matcher: ['/((?!api|auth|_next|_vercel).*)'],
};
