import type { NextRequest } from 'next/server';

import { ApiClientError, requestIdentity } from '@/lib/api/client';
import {
  applyAuthCookies,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/session';
import type { LoginPayload, LoginResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const loginData = await requestIdentity<LoginResponse>({
      method: 'POST',
      path: '/auth/login',
      body: payload,
    });

    const response = createSuccessResponse(loginData.user);
    applyAuthCookies(response, loginData);
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
        message: 'Unable to login.',
      },
      500,
    );
  }
}
