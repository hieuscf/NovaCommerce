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

type AvatarUploadResponse = {
  key: string;
  url: string;
};

export async function POST(request: NextRequest) {
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
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Avatar file is required.',
        },
        400,
      );
    }

    const uploadBody = new FormData();
    uploadBody.append('file', file);
    uploadBody.append('folder', 'avatars');

    const result = await requestIdentityWithRefresh<AvatarUploadResponse>({
      method: 'POST',
      path: '/files/upload',
      body: uploadBody,
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
        code: 'FILE_SERVICE_UNAVAILABLE',
        message: 'Avatar upload is unavailable right now.',
      },
      503,
    );
  }
}
