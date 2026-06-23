import { NextResponse, type NextRequest } from 'next/server';

import { getSafeRedirectPath } from '@/lib/utils/url';

const SUPPORTED_PROVIDERS = new Set(['google', 'facebook']);

function getIdentityBaseUrl() {
  return (
    process.env.IDENTITY_SERVICE_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ''
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const provider = params.provider.toLowerCase();

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      {
        data: null,
        meta: null,
        error: {
          code: 'INVALID_PROVIDER',
          message: 'Unsupported OAuth provider.',
        },
      },
      { status: 400 },
    );
  }

  const redirect = getSafeRedirectPath(
    request.nextUrl.searchParams.get('redirect'),
    '/',
  );
  const callbackUrl = `${request.nextUrl.origin}/api/auth/oauth/${provider}/callback?redirect=${encodeURIComponent(
    redirect,
  )}`;

  const target = `${getIdentityBaseUrl()}/auth/oauth/${provider}?redirect_url=${encodeURIComponent(
    callbackUrl,
  )}`;

  return NextResponse.redirect(target);
}
