import { describe, expect, it } from 'vitest';
import { isAdminProtectedPath, isAdminPublicPath } from '../route-policy';

describe('admin route policy', () => {
  it('treats login as public', () => {
    expect(isAdminPublicPath('/login')).toBe(true);
    expect(isAdminProtectedPath('/login')).toBe(false);
  });

  it('treats operational routes as protected UX boundaries', () => {
    expect(isAdminProtectedPath('/')).toBe(true);
    expect(isAdminProtectedPath('/orders')).toBe(true);
  });
});
