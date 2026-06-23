import { NextResponse, type NextRequest } from 'next/server';

import { ApiClientError, requestIdentity } from '@/lib/api/client';
import { applyAuthCookies } from '@/lib/auth/session';
import { getSafeRedirectPath } from '@/lib/utils/url';
import type { LoginResponse } from '@/types/auth';

const SUPPORTED_PROVIDERS = new Set(['google', 'facebook']);

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const provider = params.provider.toLowerCase();
  const redirectPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get('redirect'),
    '/',
  );

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    return NextResponse.redirect(
      new URL(`/login?oauthError=INVALID_PROVIDER`, request.url),
    );
  }

  const callbackQuery = request.nextUrl.searchParams.toString();

  try {
    const data = await requestIdentity<LoginResponse>({
      path: `/auth/oauth/${provider}/callback?${callbackQuery}`,
    });

    const destination = new URL(redirectPath, request.url);
    const response = NextResponse.redirect(destination);
    applyAuthCookies(response, data);

    return response;
  } catch (error) {
    const err = error instanceof ApiClientError ? error : null;
    const code = err?.code ?? 'OAUTH_FAILED';
    const destination = new URL(
      `/login?oauthError=${encodeURIComponent(code)}`,
      request.url,
    );
    return NextResponse.redirect(destination);
  }
}
