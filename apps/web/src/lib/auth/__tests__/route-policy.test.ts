import { describe, expect, it } from 'vitest';
import { isCustomerProtectedPath } from '../route-policy';

describe('isCustomerProtectedPath', () => {
  it('protects customer account routes', () => {
    expect(isCustomerProtectedPath('/account')).toBe(true);
    expect(isCustomerProtectedPath('/account/orders/1')).toBe(true);
    expect(isCustomerProtectedPath('/orders')).toBe(true);
    expect(isCustomerProtectedPath('/checkout')).toBe(true);
  });

  it('leaves public storefront and auth routes open', () => {
    expect(isCustomerProtectedPath('/')).toBe(false);
    expect(isCustomerProtectedPath('/shop')).toBe(false);
    expect(isCustomerProtectedPath('/login')).toBe(false);
    expect(isCustomerProtectedPath('/unauthorized')).toBe(false);
    expect(isCustomerProtectedPath('/account-recovery')).toBe(false);
  });
});
