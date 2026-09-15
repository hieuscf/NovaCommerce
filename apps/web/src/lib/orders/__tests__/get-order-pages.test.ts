import { describe, expect, it } from 'vitest';
import { getOrderListPage } from '../get-order-list';
import { getOrderDetail } from '../get-order-detail';
import { getOrderConfirmed } from '../get-order-confirmed';

describe('getOrderListPage', () => {
  it('returns the Alloy fixture list with pagination', () => {
    const list = getOrderListPage({ status: 'all', page: 1 });

    expect(list.items[0]?.orderNumber).toBe('NC2026001');
    expect(list.items[0]?.status).toBe('shipped');
    expect(list.items[0]?.total).toBe(1843.56);
    expect(list.items).toHaveLength(5);
    expect(list.totalPages).toBeGreaterThan(1);
    expect(list.crumbs.at(-1)?.label).toBe('My Orders');
  });

  it('filters by fulfillment status from the URL', () => {
    const list = getOrderListPage({ status: 'cancelled', page: 1 });

    expect(list.items.every((item) => item.status === 'cancelled')).toBe(true);
    expect(list.items[0]?.orderNumber).toBe('NC2026007');
  });
});

describe('getOrderDetail', () => {
  it('hydrates the featured order from catalog photos', () => {
    const detail = getOrderDetail('#NC2026001');

    expect(detail?.orderNumber).toBe('NC2026001');
    expect(detail?.items).toHaveLength(3);
    expect(detail?.items[0]?.name).toBe('MacBook Air M2 13"');
    expect(detail?.summary.total).toBe(1843.56);
    expect(detail?.shipping.carrier).toBe('FedEx');
  });

  it('returns undefined for an unknown order number', () => {
    expect(getOrderDetail('MISSING')).toBeUndefined();
  });
});

describe('getOrderConfirmed', () => {
  it('reuses the featured fixture for the confirmation preview', () => {
    const confirmation = getOrderConfirmed();

    expect(confirmation.orderNumber).toBe('NC2026001');
    expect(confirmation.detailHref).toBe('/orders/NC2026001');
    expect(confirmation.paymentLabel).toBe('Visa **** 4242');
    expect(confirmation.progress[0]?.state).toBe('complete');
    expect(confirmation.progress[1]?.state).toBe('current');
  });
});
