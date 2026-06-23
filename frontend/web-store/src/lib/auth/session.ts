import { NextResponse, type NextRequest } from 'next/server';

import { cookieAges, cookieKeys, getAuthCookieConfig } from '@/lib/api/client';
import type { ApiErrorPayload } from '@/types/api';
import type { AuthTokens } from '@/types/auth';

export function createErrorResponse(error: ApiErrorPayload, status = 400) {
  return NextResponse.json(
    {
      data: null,
      meta: null,
      error,
    },
    { status },
  );
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      data,
      meta: null,
      error: null,
    },
    { status },
  );
}

export function applyAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set(
    cookieKeys.accessToken,
    tokens.access_token,
    getAuthCookieConfig(cookieAges.accessToken),
  );
  response.cookies.set(
    cookieKeys.refreshToken,
    tokens.refresh_token,
    getAuthCookieConfig(cookieAges.refreshToken),
  );
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(cookieKeys.accessToken, '', getAuthCookieConfig(0));
  response.cookies.set(cookieKeys.refreshToken, '', getAuthCookieConfig(0));
}

export function getLocalePrefix(request: NextRequest) {
  const locale = request.nextUrl.pathname.split('/').filter(Boolean)[0] ?? 'vi';
  return `/${locale}`;
}
