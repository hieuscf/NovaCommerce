import { describe, expect, it } from 'vitest';
import { buildLoginHref, buildRegisterHref, getSafeAuthReturnUrl } from '../return-url';

describe('getSafeAuthReturnUrl', () => {
  it('prefers returnUrl over redirect and sanitizes both', () => {
    expect(getSafeAuthReturnUrl(new URLSearchParams('returnUrl=/account&redirect=/shop'))).toBe(
      '/account',
    );
    expect(getSafeAuthReturnUrl(new URLSearchParams('redirect=/account'))).toBe('/account');
    expect(getSafeAuthReturnUrl(new URLSearchParams('returnUrl=https://evil.example'))).toBe('/');
    expect(getSafeAuthReturnUrl(new URLSearchParams('returnUrl=//evil.example'))).toBe('/');
  });
});

describe('buildLoginHref', () => {
  it('omits a home returnUrl and preserves session reasons', () => {
    expect(buildLoginHref('/')).toBe('/login');
    expect(buildLoginHref('/account', 'session-expired')).toBe(
      '/login?returnUrl=%2Faccount&reason=session-expired',
    );
  });
});

describe('buildRegisterHref', () => {
  it('only appends a sanitized returnUrl', () => {
    expect(buildRegisterHref('/')).toBe('/register');
    expect(buildRegisterHref('/account')).toBe('/register?returnUrl=%2Faccount');
    expect(buildRegisterHref('https://evil.example')).toBe('/register');
  });
});
