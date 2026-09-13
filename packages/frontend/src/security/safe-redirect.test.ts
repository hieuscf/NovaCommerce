import { describe, expect, it } from 'vitest';
import { isSafeRedirectPath, sanitizeRedirect } from './safe-redirect';

describe('sanitizeRedirect', () => {
  it('allows internal paths', () => {
    expect(isSafeRedirectPath('/account/orders')).toBe(true);
    expect(sanitizeRedirect('/shop?q=laptop')).toBe('/shop?q=laptop');
  });

  it('rejects open redirects', () => {
    expect(isSafeRedirectPath('https://evil.example')).toBe(false);
    expect(isSafeRedirectPath('//evil.example')).toBe(false);
    expect(sanitizeRedirect('https://evil.example', '/')).toBe('/');
    expect(sanitizeRedirect(null, '/login')).toBe('/login');
  });
});
