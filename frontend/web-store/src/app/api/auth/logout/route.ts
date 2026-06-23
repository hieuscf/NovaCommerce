import type { NextRequest } from 'next/server';

import {
  ApiClientError,
  extractAuthCookies,
  requestIdentity,
} from '@/lib/api/client';
import {
  clearAuthCookies,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const { refreshToken } = extractAuthCookies(request);

  try {
    if (refreshToken) {
      await requestIdentity<null>({
        method: 'POST',
        path: '/auth/logout',
        body: { refresh_token: refreshToken },
      });
    }

    const response = createSuccessResponse({ success: true });
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
        message: 'Unable to logout.',
      },
      500,
    );
    clearAuthCookies(response);
    return response;
  }
}
