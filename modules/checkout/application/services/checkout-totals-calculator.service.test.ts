import { describe, expect, it } from 'vitest';
import { calculateCheckoutTotals } from './checkout-totals-calculator.service';

describe('calculateCheckoutTotals', () => {
  it('calculates subtotal and total with discount', () => {
    const totals = calculateCheckoutTotals(
      [{ unitPriceAmount: 100, quantity: 2 }],
      [{ type: 'discount', amount: 20 }],
    );

    expect(totals.subtotalAmount).toBe(200);
    expect(totals.totalAmount).toBe(180);
  });

  it('includes shipping and tax', () => {
    const totals = calculateCheckoutTotals(
      [{ unitPriceAmount: 50, quantity: 1 }],
      [
        { type: 'shipping', amount: 5 },
        { type: 'tax', amount: 2 },
      ],
    );

    expect(totals.totalAmount).toBe(57);
  });
});
