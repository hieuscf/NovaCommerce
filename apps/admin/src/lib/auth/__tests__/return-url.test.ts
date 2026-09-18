import { describe, expect, it } from 'vitest';
import { buildLoginHref, getSafeAuthReturnUrl } from '../return-url';

describe('getSafeAuthReturnUrl', () => {
  it('prefers returnUrl and sanitizes', () => {
    expect(
      getSafeAuthReturnUrl({
        get: (name) => (name === 'returnUrl' ? '/accounts/roles' : null),
      }),
    ).toBe('/accounts/roles');
  });

  it('falls back for unsafe values', () => {
    expect(
      getSafeAuthReturnUrl({
        get: (name) => (name === 'returnUrl' ? 'https://evil.example' : null),
      }),
    ).toBe('/');
  });
});

describe('buildLoginHref', () => {
  it('omits default return path', () => {
    expect(buildLoginHref('/')).toBe('/login');
  });

  it('includes returnUrl and reason', () => {
    expect(buildLoginHref('/accounts/roles', 'session-required')).toBe(
      '/login?returnUrl=%2Faccounts%2Froles&reason=session-required',
    );
  });
});
