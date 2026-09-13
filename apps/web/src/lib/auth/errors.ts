import {
  ApiClientError as AuthApiError,
  getUserFacingMessage,
  isApiClientError as isUserFacingError,
} from '@novacommerce/frontend';
import type { AuthErrorKind } from './types';

export { AuthApiError, getUserFacingMessage, isUserFacingError };

const KIND_COPY: Readonly<
  Record<AuthErrorKind, { readonly title: string; readonly description: string }>
> = {
  invalid_credentials: {
    title: 'Unable to sign in',
    description: 'Email or password is incorrect. Please try again.',
  },
  account_unavailable: {
    title: 'Account unavailable',
    description:
      'This account cannot be used right now. Please try again later or contact support.',
  },
  session_expired: {
    title: 'Your session has expired',
    description: 'Please sign in again to continue.',
  },
  network: {
    title: 'Connection problem',
    description: 'We could not reach NovaCommerce. Check your connection and try again.',
  },
  server: {
    title: 'Something went wrong',
    description: 'Please try again in a moment.',
  },
  rate_limited: {
    title: 'Too many attempts',
    description: 'Please wait a moment and try again.',
  },
  conflict: {
    title: 'Account already exists',
    description: 'An account with this email already exists. Please sign in instead.',
  },
  unknown: {
    title: 'Unable to continue',
    description: 'Something went wrong. Please try again.',
  },
};

export function getAuthErrorCopy(kind: AuthErrorKind): (typeof KIND_COPY)[AuthErrorKind] {
  return KIND_COPY[kind];
}

export function toAuthErrorKind(error: unknown): AuthErrorKind {
  if (!isUserFacingError(error)) {
    return 'unknown';
  }

  switch (error.category) {
    case 'authentication':
      return error.code === 'SESSION_EXPIRED' ? 'session_expired' : 'invalid_credentials';
    case 'authorization':
      return 'account_unavailable';
    case 'rate_limit':
      return 'rate_limited';
    case 'network':
      return 'network';
    case 'server':
      return 'server';
    case 'conflict':
      return 'conflict';
    default:
      return 'unknown';
  }
}

export function toAuthFormError(error: unknown): { kind: AuthErrorKind; message: string } {
  const kind = toAuthErrorKind(error);
  if (kind === 'conflict' || kind === 'invalid_credentials' || kind === 'rate_limited') {
    return { kind, message: getAuthErrorCopy(kind).description };
  }
  if (isUserFacingError(error)) {
    return { kind, message: getUserFacingMessage(error) };
  }
  return { kind, message: getAuthErrorCopy(kind).description };
}
