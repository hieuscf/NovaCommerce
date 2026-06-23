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
import type { ChangePasswordPayload } from '@/types/auth';

export async function PUT(request: NextRequest) {
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
    const payload = (await request.json()) as ChangePasswordPayload;
    const result = await requestIdentityWithRefresh<{ message: string }>({
      method: 'PUT',
      path: '/auth/change-password',
      body: payload,
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
        message: 'Unable to change password.',
      },
      500,
    );
  }
}
