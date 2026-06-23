import type { NextRequest } from 'next/server';

import { ApiClientError, requestIdentity } from '@/lib/api/client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth/session';
import type { ForgotPasswordPayload } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ForgotPasswordPayload;
    const data = await requestIdentity<{ message: string }>({
      method: 'POST',
      path: '/auth/forgot-password',
      body: payload,
    });

    return createSuccessResponse(data);
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
        message: 'Unable to process forgot password request.',
      },
      500,
    );
  }
}
