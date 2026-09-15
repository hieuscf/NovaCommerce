import { describe, expect, it } from 'vitest';
import {
  CART_DISPLAY_TAX_RATE,
  CART_FREE_SHIPPING_THRESHOLD,
  lineTotal,
  summarizeCart,
  type CartLineViewModel,
} from '../cart';

function line(overrides: Partial<CartLineViewModel> = {}): CartLineViewModel {
  return {
    id: 'line-1',
    productId: 'p-1',
    slug: 'sample',
    name: 'Sample',
    imageUrl: '/sample.jpg',
    variantLabel: 'Default',
    unitPrice: 100,
    quantity: 1,
    currency: 'USD',
    inStock: true,
    selected: true,
    ...overrides,
  };
}

describe('summarizeCart', () => {
  it('matches the Alloy cart totals for the three fixture lines', () => {
    const summary = summarizeCart([
      line({ id: 'mac', unitPrice: 999, quantity: 1 }),
      line({ id: 'sony', unitPrice: 279, quantity: 2 }),
      line({ id: 'watch', unitPrice: 429, quantity: 1 }),
    ]);

    expect(summary.itemCount).toBe(3);
    expect(summary.selectedCount).toBe(3);
    expect(summary.subtotal).toBe(1986);
    expect(summary.tax).toBe(158.88);
    expect(summary.shipping).toBe(0);
    expect(summary.total).toBe(2144.88);
    expect(summary.taxRatePercent).toBe(CART_DISPLAY_TAX_RATE * 100);
    expect(summary.freeShippingUnlocked).toBe(true);
    expect(summary.amountToFreeShipping).toBe(0);
  });

  it('excludes unselected lines from subtotal and tax', () => {
    const summary = summarizeCart([
      line({ id: 'keep', unitPrice: 100, quantity: 1, selected: true }),
      line({ id: 'skip', unitPrice: 999, quantity: 2, selected: false }),
    ]);

    expect(summary.subtotal).toBe(100);
    expect(summary.tax).toBe(8);
    expect(summary.total).toBe(108);
    expect(summary.selectedCount).toBe(1);
    expect(summary.itemCount).toBe(2);
  });

  it('reports remaining amount until the free-shipping threshold', () => {
    const summary = summarizeCart([line({ unitPrice: 20, quantity: 1 })]);

    expect(summary.freeShippingUnlocked).toBe(false);
    expect(summary.amountToFreeShipping).toBe(CART_FREE_SHIPPING_THRESHOLD - 20);
    expect(summary.shipping).toBe(0);
  });
});

describe('lineTotal', () => {
  it('multiplies unit price by quantity', () => {
    expect(lineTotal({ unitPrice: 279, quantity: 2 })).toBe(558);
  });
});
