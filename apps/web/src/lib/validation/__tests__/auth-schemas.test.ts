import { describe, expect, it } from 'vitest';
import { evaluatePasswordStrength, loginSchema, registerSchema } from '../auth-schemas';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'SecurePass1' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: 'SecurePass1' });
    expect(result.success).toBe(false);
  });

  it('rejects a short password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration data with matching passwords and terms', () => {
    const result = registerSchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
      termsAccepted: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'SecurePass1!',
      confirmPassword: 'Different1!',
      termsAccepted: true,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.message === 'Passwords do not match')).toBe(true);
  });

  it('rejects unchecked terms', () => {
    const result = registerSchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
      termsAccepted: false,
    });
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((i) => i.message.includes('Terms of Service')),
    ).toBe(true);
  });
});

describe('evaluatePasswordStrength', () => {
  it('returns weak for short simple password', () => {
    const result = evaluatePasswordStrength('abc');
    expect(result.score).toBe(0);
    expect(result.label).toBe('Weak');
  });

  it('returns strong for varied password', () => {
    const result = evaluatePasswordStrength('StrongPass1!');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.label).toBe('Strong');
  });
});
