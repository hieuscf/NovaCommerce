import type { NextRequest } from 'next/server';

import { ApiClientError, requestIdentity } from '@/lib/api/client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth/session';
import type { RegisterPayload, RegisterResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RegisterPayload;

    const registerData = await requestIdentity<RegisterResponse>({
      method: 'POST',
      path: '/auth/register',
      body: {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        full_name: payload.full_name,
        ...(payload.phone ? { phone: payload.phone } : {}),
      },
    });

    return createSuccessResponse(registerData, 201);
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
        message: 'Unable to register.',
      },
      500,
    );
  }
}
