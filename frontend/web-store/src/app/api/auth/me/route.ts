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
import type { AuthUser } from '@/types/auth';

export async function GET(request: NextRequest) {
  const { accessToken, refreshToken } = extractAuthCookies(request);

  if (!accessToken && !refreshToken) {
    return createErrorResponse(
      {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
      401,
    );
  }

  try {
    const result = await requestIdentityWithRefresh<AuthUser>({
      path: '/auth/me',
      accessToken,
      refreshToken,
    });

    const response = createSuccessResponse(result.data);
    if (result.refreshedTokens) {
      applyAuthCookies(response, result.refreshedTokens);
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
        message: 'Unable to load current user.',
      },
      500,
    );
  }
}
