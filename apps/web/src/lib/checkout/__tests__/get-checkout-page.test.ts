import { describe, expect, it } from 'vitest';
import { getCheckoutPage } from '../get-checkout-page';

describe('getCheckoutPage', () => {
  it('joins selected cart lines with customer and shipping fixtures', () => {
    const page = getCheckoutPage();

    expect(page.lines).toHaveLength(3);
    expect(page.lines[0]).toMatchObject({
      name: 'MacBook Air M2 13"',
      variantLabel: 'Space Gray · 256GB · 8GB',
      unitPrice: 999,
    });
    expect(page.customer.fullName).toBe('Alex Johnson');
    expect(page.shipping.city).toBe('Ho Chi Minh City');
    expect(page.summary.subtotal).toBe(1986);
    expect(page.crumbs.at(-1)).toMatchObject({ label: 'Checkout', current: true });
    expect(page.paymentMethods.map((method) => method.id)).toEqual([
      'card',
      'paypal',
      'qr_pay',
      'google_pay',
    ]);
  });

  it('returns an empty checkout when no selected lines exist', () => {
    const page = getCheckoutPage([]);

    expect(page.lines).toEqual([]);
    expect(page.summary.itemCount).toBe(0);
    expect(page.customer.email).toBe('alex.johnson@example.com');
  });
});
