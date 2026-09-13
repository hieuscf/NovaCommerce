import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@novacommerce/frontend';
import { toFormError } from '../errors';

describe('toFormError', () => {
  it('maps authentication errors to a user-facing message', () => {
    expect(
      toFormError(
        new ApiClientError({
          category: 'authentication',
          code: 'UNAUTHENTICATED',
          message: 'Invalid credentials',
        }),
      ),
    ).toBe('Email or password is incorrect. Please try again.');
  });

  it('hides unexpected thrown values', () => {
    expect(toFormError(new Error('ECONNREFUSED 127.0.0.1:3000'))).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
