import { categoryFromBackendCode, categoryFromStatus } from './categories';
import { ApiClientError, unexpectedError } from './api-client-error';
import type { ApiErrorEnvelope } from '../http/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (!isRecord(value) || !isRecord(value.error)) {
    return false;
  }
  return typeof value.error.code === 'string' && typeof value.error.message === 'string';
}

export function normalizeApiError(body: unknown, status: number): ApiClientError {
  if (isApiErrorEnvelope(body)) {
    const { code, message, details, requestId } = body.error;
    return new ApiClientError({
      category: categoryFromBackendCode(code, status),
      code,
      message,
      status,
      requestId,
      details,
    });
  }

  return new ApiClientError({
    category: categoryFromStatus(status),
    code: status === 401 ? 'UNAUTHENTICATED' : 'UNKNOWN_ERROR',
    message: 'Request failed',
    status,
  });
}

export function normalizeUnknownError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }
  return unexpectedError();
}
