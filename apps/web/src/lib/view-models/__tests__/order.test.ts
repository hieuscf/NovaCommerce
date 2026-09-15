import { describe, expect, it } from 'vitest';
import {
  formatOrderNumber,
  normalizeOrderNumber,
  orderHref,
  paymentMaskedLabel,
} from '../order';

describe('order number helpers', () => {
  it('normalizes hashes and casing for URLs', () => {
    expect(normalizeOrderNumber('#nc2026001')).toBe('NC2026001');
    expect(formatOrderNumber('NC2026001')).toBe('#NC2026001');
    expect(orderHref('#NC2026001')).toBe('/orders/NC2026001');
  });

  it('masks a saved card for the confirmation card', () => {
    expect(
      paymentMaskedLabel({
        brand: 'Visa',
        last4: '4242',
        paidAtLabel: 'Paid on Sep 12, 10:42 AM',
        status: 'paid',
      }),
    ).toBe('Visa **** 4242');
  });
});
