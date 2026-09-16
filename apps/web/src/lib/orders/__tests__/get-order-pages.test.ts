import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getOrderListPage } from '../get-order-list';
import { getOrderDetail } from '../get-order-detail';
import { getOrderConfirmed } from '../get-order-confirmed';
import {
  formatOrderPlacedAt,
  mapOrderListToPageViewModel,
  mapOrderToListItem,
  toApiOrderStatus,
  toOrderListStatus,
} from '../mappers';
import type { OrderDto, OrderListDto } from '../types';

const getOrderHistory = vi.fn();

vi.mock('../client', () => ({
  orderClient: {
    getOrderHistory: (...args: unknown[]) => getOrderHistory(...args),
    getOrderById: vi.fn(),
  },
}));

const sampleOrder: OrderDto = {
  id: '11111111-1111-1111-1111-111111111111',
  orderNumber: 'ORD-1001',
  customerId: '22222222-2222-2222-2222-222222222222',
  status: 'confirmed',
  totalAmount: 199.5,
  totalCurrency: 'USD',
  lines: [
    {
      id: 'line-1',
      productId: 'p-macbook-air',
      quantity: 1,
      unitPriceAmount: 199.5,
      unitPriceCurrency: 'USD',
      lineTotalAmount: 199.5,
      createdAt: '2026-09-12T10:42:00.000Z',
      updatedAt: '2026-09-12T10:42:00.000Z',
    },
  ],
  lineCount: 1,
  createdAt: '2026-09-12T10:42:00.000Z',
  updatedAt: '2026-09-12T10:42:00.000Z',
};

describe('order mappers', () => {
  it('maps Alloy filters to Gateway order statuses', () => {
    expect(toApiOrderStatus('all')).toBeUndefined();
    expect(toApiOrderStatus('processing')).toBe('pending');
    expect(toApiOrderStatus('shipped')).toBe('confirmed');
    expect(toApiOrderStatus('delivered')).toBe('completed');
    expect(toApiOrderStatus('cancelled')).toBe('cancelled');
  });

  it('maps Gateway statuses to Alloy list badges', () => {
    expect(toOrderListStatus('pending')).toBe('processing');
    expect(toOrderListStatus('confirmed')).toBe('shipped');
    expect(toOrderListStatus('completed')).toBe('delivered');
    expect(toOrderListStatus('cancelled')).toBe('cancelled');
  });

  it('formats placed-at labels for the list row', () => {
    expect(formatOrderPlacedAt('2026-09-12T10:42:00.000Z')).toMatch(/Sep 12,? 2026/);
  });

  it('maps an order DTO into a list item view-model', () => {
    const item = mapOrderToListItem(sampleOrder);

    expect(item.orderNumber).toBe('ORD-1001');
    expect(item.status).toBe('shipped');
    expect(item.total).toBe(199.5);
    expect(item.itemCount).toBe(1);
    expect(item.thumbnails).toHaveLength(1);
    expect(item.thumbnails[0]?.alt).toBe('MacBook Air M2 13"');
  });

  it('maps a paginated list DTO into the page view-model', () => {
    const dto: OrderListDto = {
      items: [sampleOrder],
      total: 6,
      page: 2,
      pageSize: 5,
    };

    const page = mapOrderListToPageViewModel(dto, { status: 'shipped', page: 2 });

    expect(page.total).toBe(6);
    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(2);
    expect(page.status).toBe('shipped');
    expect(page.items).toHaveLength(1);
    expect(page.crumbs.at(-1)?.label).toBe('My Orders');
  });
});

describe('getOrderListPage', () => {
  beforeEach(() => {
    getOrderHistory.mockReset();
  });

  it('loads the order list from the Gateway client', async () => {
    getOrderHistory.mockResolvedValue({
      items: [sampleOrder],
      total: 1,
      page: 1,
      pageSize: 5,
    } satisfies OrderListDto);

    const list = await getOrderListPage({ status: 'all', page: 1 });

    expect(getOrderHistory).toHaveBeenCalledWith({
      page: 1,
      pageSize: 5,
      status: undefined,
    });
    expect(list.items[0]?.orderNumber).toBe('ORD-1001');
    expect(list.items[0]?.status).toBe('shipped');
    expect(list.total).toBe(1);
  });

  it('forwards Alloy status filters as Gateway statuses', async () => {
    getOrderHistory.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 5,
    } satisfies OrderListDto);

    await getOrderListPage({ status: 'cancelled', page: 1 });

    expect(getOrderHistory).toHaveBeenCalledWith({
      page: 1,
      pageSize: 5,
      status: 'cancelled',
    });
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
