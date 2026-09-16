import { describe, expect, it } from 'vitest';
import {
  formatCardExpiry,
  mapSavedPaymentMethodToAccountViewModel,
  mapSavedPaymentMethodToViewModel,
} from '../mappers';
import type { SavedPaymentMethodDto } from '../types';

const sample: SavedPaymentMethodDto = {
  id: 'pm_1',
  brand: 'visa',
  last4: '4242',
  expMonth: 12,
  expYear: 2029,
  cardholderName: 'Jane Doe',
  isDefault: true,
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
};

describe('payment mappers', () => {
  it('formats expiry as MM/YY', () => {
    expect(formatCardExpiry(3, 2030)).toBe('03/30');
    expect(formatCardExpiry(12, 2029)).toBe('12/29');
  });

  it('maps API dto to Alloy account row view model', () => {
    expect(mapSavedPaymentMethodToAccountViewModel(sample)).toEqual({
      id: 'pm_1',
      brand: 'visa',
      last4: '4242',
      expires: '12/29',
      isDefault: true,
    });
  });

  it('falls back unknown brands to card', () => {
    expect(
      mapSavedPaymentMethodToAccountViewModel({ ...sample, brand: 'discover' }).brand,
    ).toBe('card');
  });

  it('maps checkout view model labels', () => {
    expect(mapSavedPaymentMethodToViewModel(sample)).toMatchObject({
      brandLabel: 'Visa',
      maskedLabel: 'Visa •••• 4242',
      expLabel: '12/29',
      isDefault: true,
    });
  });
});
