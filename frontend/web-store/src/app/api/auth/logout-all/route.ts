import type { NextRequest } from 'next/server';

import {
  ApiClientError,
  extractAuthCookies,
  requestIdentityWithRefresh,
} from '@/lib/api/client';
import {
  applyAuthCookies,
  clearAuthCookies,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const { accessToken, refreshToken } = extractAuthCookies(request);

  if (!accessToken && !refreshToken) {
    const response = createSuccessResponse({ success: true });
    clearAuthCookies(response);
    return response;
  }

  try {
    const result = await requestIdentityWithRefresh<null>({
      method: 'POST',
      path: '/auth/logout-all',
      accessToken,
      refreshToken,
    });

    const response = createSuccessResponse({ success: true });
    if (result.refreshedTokens) {
      applyAuthCookies(response, result.refreshedTokens);
    }
    clearAuthCookies(response);
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      const response = createErrorResponse(
        { code: error.code, message: error.message },
        error.status,
      );
      clearAuthCookies(response);
      return response;
    }

    const response = createErrorResponse(
      {
        code: 'LOGOUT_FAILED',
        message: 'Unable to logout from all devices.',
      },
      500,
    );
    clearAuthCookies(response);
    return response;
  }
}
