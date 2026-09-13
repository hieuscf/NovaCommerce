import { describe, expect, it } from 'vitest';
import { ApiClientError } from './api-client-error';
import { getUserFacingMessage } from './user-messages';

describe('getUserFacingMessage', () => {
  it('returns a concise authentication message', () => {
    const error = new ApiClientError({
      category: 'authentication',
      code: 'UNAUTHENTICATED',
      message: 'Invalid credentials',
    });
    expect(getUserFacingMessage(error)).toBe('Email or password is incorrect. Please try again.');
  });

  it('does not surface technical backend messages', () => {
    const error = new ApiClientError({
      category: 'server',
      code: 'INTERNAL_ERROR',
      message: 'PrismaClientKnownRequestError',
    });
    expect(getUserFacingMessage(error)).toBe('Something went wrong. Please try again.');
    expect(getUserFacingMessage(error)).not.toMatch(/prisma/i);
  });

  it('keeps non-technical validation messages', () => {
    const error = new ApiClientError({
      category: 'validation',
      code: 'VALIDATION_ERROR',
      message: 'Email is required',
    });
    expect(getUserFacingMessage(error)).toBe('Email is required');
  });
});
