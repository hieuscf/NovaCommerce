import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const protectedPrefixes = ['/account', '/checkout'];

function getLocaleFromPathname(pathname: string) {
  const [first] = pathname.split('/').filter(Boolean);
  return routing.locales.includes(first as (typeof routing.locales)[number])
    ? first
    : routing.defaultLocale;
}

function getPathWithoutLocale(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return '/';
  }

  if (
    routing.locales.includes(segments[0] as (typeof routing.locales)[number])
  ) {
    return `/${segments.slice(1).join('/') || ''}`.replace(/\/$/, '') || '/';
  }

  return pathname;
}

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function middleware(request: NextRequest) {
  const locale = getLocaleFromPathname(request.nextUrl.pathname);
  const pathWithoutLocale = getPathWithoutLocale(request.nextUrl.pathname);

  if (isProtectedPath(pathWithoutLocale)) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', redirectTarget);
      return NextResponse.redirect(loginUrl);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
