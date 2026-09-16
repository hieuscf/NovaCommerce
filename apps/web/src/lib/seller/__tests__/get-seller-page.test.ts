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
    expect(page.sellingModels.map((item) => item.value)).toEqual([
      'retail',
      'official',
      'manufacturer',
    ]);
    expect(page.verificationDocuments.map((item) => item.field)).toEqual([
      'authorizationLetter',
      'qualityCertificate',
      'originInvoice',
    ]);
    expect(page.termsSections.map((item) => item.number)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ]);
    expect(page.termsSections[0]?.title).toBe('General Terms');
  });

  it('can preview the registered branch without calling a Seller API', () => {
    expect(getSellerPage('registered').status).toBe('registered');
  });
});
