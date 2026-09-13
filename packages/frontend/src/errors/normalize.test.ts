import { describe, expect, it } from 'vitest';
import { normalizeApiError, normalizeUnknownError } from './normalize';
import { ApiClientError } from './api-client-error';

describe('normalizeApiError', () => {
  it('maps backend codes to frontend categories', () => {
    const error = normalizeApiError(
      {
        error: {
          code: 'IDENTITY_ALREADY_EXISTS',
          message: 'Email already registered',
          requestId: 'req-1',
        },
      },
      409,
    );

    expect(error.category).toBe('conflict');
    expect(error.code).toBe('IDENTITY_ALREADY_EXISTS');
    expect(error.requestId).toBe('req-1');
  });

  it('falls back to HTTP status when the body is not an envelope', () => {
    const error = normalizeApiError('plain text', 404);
    expect(error.category).toBe('not_found');
    expect(error.code).toBe('UNKNOWN_ERROR');
  });
});

describe('normalizeUnknownError', () => {
  it('passes through ApiClientError instances', () => {
    const original = new ApiClientError({
      category: 'validation',
      code: 'VALIDATION_ERROR',
      message: 'Email is required',
    });
    expect(normalizeUnknownError(original)).toBe(original);
  });

  it('does not expose arbitrary thrown values', () => {
    const error = normalizeUnknownError(new Error('PrismaClientKnownRequestError'));
    expect(error.category).toBe('unknown');
    expect(error.message).toBe('Something went wrong. Please try again.');
  });
});
