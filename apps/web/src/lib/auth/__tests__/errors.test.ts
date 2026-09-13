import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@novacommerce/frontend';
import { toAuthErrorKind, toAuthFormError } from '../errors';

describe('toAuthErrorKind', () => {
  it('maps API categories to user-facing auth kinds', () => {
    expect(
      toAuthErrorKind(
        new ApiClientError({
          category: 'authentication',
          code: 'INVALID_CREDENTIALS',
          message: 'x',
        }),
      ),
    ).toBe('invalid_credentials');
    expect(
      toAuthErrorKind(
        new ApiClientError({ category: 'rate_limit', code: 'RATE_LIMITED', message: 'x' }),
      ),
    ).toBe('rate_limited');
    expect(
      toAuthErrorKind(
        new ApiClientError({ category: 'network', code: 'NETWORK_ERROR', message: 'x' }),
      ),
    ).toBe('network');
    expect(toAuthErrorKind(new Error('boom'))).toBe('unknown');
  });
});

describe('toAuthFormError', () => {
  it('never returns raw technical messages', () => {
    const result = toAuthFormError(
      new ApiClientError({
        category: 'server',
        code: 'INTERNAL_ERROR',
        message: 'PrismaClientKnownRequestError',
      }),
    );
    expect(result.kind).toBe('server');
    expect(result.message).not.toMatch(/prisma/i);
  });
});
