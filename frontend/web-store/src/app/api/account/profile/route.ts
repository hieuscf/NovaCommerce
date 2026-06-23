import type { NextRequest } from 'next/server';

import {
  ApiClientError,
  extractAuthCookies,
  requestIdentityWithRefresh,
} from '@/lib/api/client';
import {
  applyAuthCookies,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/session';
import type { AuthTokens, AuthUser, UpdateProfilePayload } from '@/types/auth';

function getEffectiveTokens(
  fallback: { accessToken: string | null; refreshToken: string | null },
  refreshed?: AuthTokens,
) {
  if (!refreshed) {
    return fallback;
  }

  return {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
  };
}

export async function PUT(request: NextRequest) {
  const cookieTokens = extractAuthCookies(request);

  if (!cookieTokens.accessToken && !cookieTokens.refreshToken) {
    return createErrorResponse(
      {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
      401,
    );
  }

  try {
    const payload = (await request.json()) as UpdateProfilePayload;
    const meResult = await requestIdentityWithRefresh<AuthUser>({
      path: '/auth/me',
      accessToken: cookieTokens.accessToken,
      refreshToken: cookieTokens.refreshToken,
    });

    const effectiveTokens = getEffectiveTokens(
      cookieTokens,
      meResult.refreshedTokens,
    );
    const updateResult = await requestIdentityWithRefresh<AuthUser>({
      method: 'PUT',
      path: `/users/${meResult.data.id}`,
      body: payload,
      accessToken: effectiveTokens.accessToken,
      refreshToken: effectiveTokens.refreshToken,
    });

    const response = createSuccessResponse(updateResult.data);
    const refreshedTokens =
      updateResult.refreshedTokens ?? meResult.refreshedTokens;
    if (refreshedTokens) {
      applyAuthCookies(response, refreshedTokens);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      return createErrorResponse(
        { code: error.code, message: error.message },
        error.status,
      );
    }

    return createErrorResponse(
      {
        code: 'INTERNAL_ERROR',
        message: 'Unable to update profile.',
      },
      500,
    );
  }
}
