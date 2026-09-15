import { describe, expect, it } from 'vitest';
import { getCartLineCount, getCartPage } from '../get-cart-page';

describe('getCartPage', () => {
  it('joins catalog merchandising onto fixture lines', () => {
    const page = getCartPage();

    expect(page.lines).toHaveLength(3);
    expect(page.lines[0]).toMatchObject({
      name: 'MacBook Air M2 13"',
      variantLabel: 'Space Gray · 256GB · 8GB',
      unitPrice: 999,
      quantity: 1,
      inStock: true,
      selected: true,
      slug: 'macbook-air-m2',
    });
    expect(page.summary.subtotal).toBe(1986);
    expect(page.summary.total).toBe(2144.88);
    expect(page.crumbs.at(-1)).toMatchObject({ label: 'Cart', current: true });
    expect(page.recommendations.length).toBe(5);
  });

  it('returns an empty cart when there are no fixture lines', () => {
    const page = getCartPage([]);

    expect(page.lines).toEqual([]);
    expect(page.summary.itemCount).toBe(0);
    expect(page.summary.total).toBe(0);
    expect(page.recommendations.length).toBeGreaterThan(0);
  });

  it('counts fixture lines for the header badge', () => {
    expect(getCartLineCount()).toBe(3);
  });
});
