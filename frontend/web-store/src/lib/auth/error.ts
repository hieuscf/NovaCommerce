import { ApiClientError } from '@/lib/api/client';

export function getErrorMessageKey(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    return 'auth.errors.generic';
  }

  const knownCodes: Record<string, string> = {
    UNAUTHORIZED: 'auth.errors.unauthorized',
    NOT_FOUND: 'auth.errors.notFound',
    VALIDATION_ERROR: 'auth.errors.validation',
    CONFLICT: 'auth.errors.conflict',
    INVALID_TOKEN: 'auth.errors.invalidToken',
    ACCOUNT_DISABLED: 'auth.errors.accountDisabled',
  };

  return knownCodes[error.code] ?? 'auth.errors.generic';
}
