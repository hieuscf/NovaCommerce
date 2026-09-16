import { describe, expect, it } from 'vitest';
import { getSellerPage, getSellerPageStatus } from '../get-seller-page';

describe('getSellerPageStatus', () => {
  it('returns unregistered until a Seller Gateway adapter exists', () => {
    expect(getSellerPageStatus()).toBe('unregistered');
  });
});

describe('getSellerPage', () => {
  it('builds the unregistered onboarding view model', () => {
    const page = getSellerPage();

    expect(page.status).toBe('unregistered');
    expect(page.businessTypes.length).toBeGreaterThan(0);
    expect(page.cities.some((item) => item.label === 'Ho Chi Minh City')).toBe(true);
    expect(page.dialCodes[0]?.dial).toBe('+84');
  });

  it('can preview the registered branch without calling a Seller API', () => {
    expect(getSellerPage('registered').status).toBe('registered');
  });
});
