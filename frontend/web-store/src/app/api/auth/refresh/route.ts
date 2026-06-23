import type { NextRequest } from 'next/server';

import {
  ApiClientError,
  extractAuthCookies,
  requestIdentity,
} from '@/lib/api/client';
import {
  applyAuthCookies,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/session';
import type { AuthTokens } from '@/types/auth';

export async function POST(request: NextRequest) {
  const { refreshToken } = extractAuthCookies(request);

  if (!refreshToken) {
    return createErrorResponse(
      {
        code: 'UNAUTHORIZED',
        message: 'Refresh token is missing.',
      },
      401,
    );
  }

  try {
    const refreshedTokens = await requestIdentity<AuthTokens>({
      method: 'POST',
      path: '/auth/refresh',
      body: { refresh_token: refreshToken },
    });

    const response = createSuccessResponse({ refreshed: true });
    applyAuthCookies(response, refreshedTokens);
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
        message: 'Unable to refresh session.',
      },
      500,
    );
  }
}
