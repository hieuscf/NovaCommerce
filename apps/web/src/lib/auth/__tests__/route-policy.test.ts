import { describe, expect, it } from 'vitest';
import { isAuthSurfacePath, isCustomerProtectedPath, isProtectedRoute } from '../route-policy';

describe('isCustomerProtectedPath', () => {
  it('protects customer account routes', () => {
    expect(isCustomerProtectedPath('/account')).toBe(true);
    expect(isCustomerProtectedPath('/account/orders/1')).toBe(true);
    expect(isCustomerProtectedPath('/orders')).toBe(true);
    expect(isCustomerProtectedPath('/checkout')).toBe(true);
    expect(isCustomerProtectedPath('/cart')).toBe(true);
  });

  it('leaves public storefront and auth routes open', () => {
    expect(isCustomerProtectedPath('/')).toBe(false);
    expect(isCustomerProtectedPath('/shop')).toBe(false);
    expect(isCustomerProtectedPath('/seller')).toBe(false);
    expect(isCustomerProtectedPath('/login')).toBe(false);
    expect(isCustomerProtectedPath('/unauthorized')).toBe(false);
    expect(isCustomerProtectedPath('/account-recovery')).toBe(false);
  });
});

describe('isProtectedRoute', () => {
  it('aliases the centralized customer policy', () => {
    expect(isProtectedRoute('/account')).toBe(true);
    expect(isProtectedRoute('/orders')).toBe(true);
    expect(isProtectedRoute('/checkout')).toBe(true);
    expect(isProtectedRoute('/login')).toBe(false);
  });
});

describe('isAuthSurfacePath', () => {
  it('keeps auth and unauthorized pages out of protected-route redirects', () => {
    expect(isAuthSurfacePath('/login')).toBe(true);
    expect(isAuthSurfacePath('/register')).toBe(true);
    expect(isAuthSurfacePath('/unauthorized')).toBe(true);
    expect(isAuthSurfacePath('/account')).toBe(false);
  });
});
