export const ERROR_CATEGORIES = [
  'validation',
  'authentication',
  'authorization',
  'not_found',
  'conflict',
  'rate_limit',
  'network',
  'server',
  'unknown',
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

const BACKEND_CODE_TO_CATEGORY: Readonly<Record<string, ErrorCategory>> = {
  VALIDATION_ERROR: 'validation',
  UNAUTHENTICATED: 'authentication',
  INVALID_CREDENTIALS: 'authentication',
  FORBIDDEN: 'authorization',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  IDENTITY_ALREADY_EXISTS: 'conflict',
  RATE_LIMITED: 'rate_limit',
  INTERNAL_ERROR: 'server',
  SERVICE_UNAVAILABLE: 'server',
};

export function categoryFromStatus(status: number): ErrorCategory {
  if (status === 400 || status === 422) {
    return 'validation';
  }
  if (status === 401) {
    return 'authentication';
  }
  if (status === 403) {
    return 'authorization';
  }
  if (status === 404) {
    return 'not_found';
  }
  if (status === 409) {
    return 'conflict';
  }
  if (status === 429) {
    return 'rate_limit';
  }
  if (status >= 500) {
    return 'server';
  }
  return 'unknown';
}

export function categoryFromBackendCode(code: string, status?: number): ErrorCategory {
  const mapped = BACKEND_CODE_TO_CATEGORY[code];
  if (mapped) {
    return mapped;
  }
  if (status !== undefined) {
    return categoryFromStatus(status);
  }
  return 'unknown';
}
