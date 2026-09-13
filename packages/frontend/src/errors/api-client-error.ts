import type { ErrorCategory } from './categories';

export interface ApiClientErrorInit {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly status?: number;
  readonly requestId?: string;
  readonly details?: Record<string, unknown>;
}

export class ApiClientError extends Error {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly status?: number;
  readonly requestId?: string;
  readonly details?: Record<string, unknown>;

  constructor(init: ApiClientErrorInit) {
    super(init.message);
    this.name = 'ApiClientError';
    this.category = init.category;
    this.code = init.code;
    this.status = init.status;
    this.requestId = init.requestId;
    this.details = init.details;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function networkError(message = 'We could not reach the server. Please try again.'): ApiClientError {
  return new ApiClientError({
    category: 'network',
    code: 'NETWORK_ERROR',
    message,
  });
}

export function timeoutError(message = 'The request took too long. Please try again.'): ApiClientError {
  return new ApiClientError({
    category: 'network',
    code: 'TIMEOUT',
    message,
  });
}

export function unexpectedError(message = 'Something went wrong. Please try again.'): ApiClientError {
  return new ApiClientError({
    category: 'unknown',
    code: 'UNKNOWN_ERROR',
    message,
  });
}
