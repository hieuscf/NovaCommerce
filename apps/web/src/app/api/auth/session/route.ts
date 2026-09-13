import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createApiClient, createRequestId, getPublicEnv } from '@novacommerce/frontend';
import {
  MOCK_REFRESH_PREFIX,
  REFRESH_COOKIE_NAME,
  REFRESH_PERSIST_COOKIE_NAME,
  buildRefreshCookieOptions,
  isDevelopmentMockRefreshToken,
  isValidRefreshTokenShape,
} from '@/lib/auth/refresh-cookie';
import type { AuthenticationResponse } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

function errorResponse(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

function accessResponse(
  tokens: Pick<AuthenticationResponse, 'accessToken' | 'tokenType' | 'expiresIn'>,
  requestId: string,
) {
  return NextResponse.json({
    data: {
      accessToken: tokens.accessToken,
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn,
    },
    meta: { requestId },
  });
}

function mockTokensFromRefresh(refreshToken: string): AuthenticationResponse {
  const email = refreshToken.slice(MOCK_REFRESH_PREFIX.length) || 'customer@novacommerce.dev';
  return {
    accessToken: `mock-access-${email}`,
    refreshToken: `${MOCK_REFRESH_PREFIX}${email}`,
    tokenType: 'Bearer',
    expiresIn: 900,
  };
}

async function writeRefreshCookies(
  refreshToken: string,
  rememberMe: boolean,
): Promise<void> {
  const jar = await cookies();
  const options = buildRefreshCookieOptions(rememberMe);
  jar.set(REFRESH_COOKIE_NAME, refreshToken, options);
  if (rememberMe) {
    jar.set(REFRESH_PERSIST_COOKIE_NAME, '1', options);
  } else {
    jar.set(REFRESH_PERSIST_COOKIE_NAME, '', { ...options, maxAge: 0 });
  }
}

async function clearRefreshCookies(): Promise<void> {
  const jar = await cookies();
  const options = buildRefreshCookieOptions(false);
  jar.set(REFRESH_COOKIE_NAME, '', { ...options, maxAge: 0 });
  jar.set(REFRESH_PERSIST_COOKIE_NAME, '', { ...options, maxAge: 0 });
}

async function refreshViaGateway(refreshToken: string): Promise<AuthenticationResponse> {
  const client = createApiClient({
    baseUrl: getPublicEnv().apiBaseUrl,
  });
  return client.post<AuthenticationResponse>('/auth/refresh', { refreshToken });
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'VALIDATION_ERROR', 'Invalid session payload', requestId);
  }

  const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  if (!isValidRefreshTokenShape(record.refreshToken)) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Invalid session payload', requestId);
  }

  await writeRefreshCookies(record.refreshToken, record.rememberMe === true);
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  const requestId = createRequestId();
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE_NAME)?.value;
  const rememberMe = jar.get(REFRESH_PERSIST_COOKIE_NAME)?.value === '1';

  if (!isValidRefreshTokenShape(refreshToken)) {
    return errorResponse(401, 'UNAUTHENTICATED', 'No session', requestId);
  }

  try {
    const tokens = isDevelopmentMockRefreshToken(refreshToken)
      ? mockTokensFromRefresh(refreshToken)
      : await refreshViaGateway(refreshToken);
    await writeRefreshCookies(tokens.refreshToken, rememberMe);
    return accessResponse(tokens, requestId);
  } catch {
    await clearRefreshCookies();
    return errorResponse(401, 'UNAUTHENTICATED', 'Session expired', requestId);
  }
}

export async function DELETE() {
  await clearRefreshCookies();
  return new NextResponse(null, { status: 204 });
}
