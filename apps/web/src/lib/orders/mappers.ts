import { catalogProducts } from '@/lib/mock-data/catalog';
import type { OrdersQuery } from '@/lib/url/orders-query';
import {
  ORDER_PAGE_SIZE,
  type OrderListItemViewModel,
  type OrderListPageViewModel,
  type OrderListStatus,
  type OrderStatusFilter,
} from '@/lib/view-models/order';
import type { ApiOrderStatus, OrderDto, OrderListDto } from './types';

const LIST_CRUMBS = [
  { href: '/', label: 'Home' },
  { href: '/account', label: 'My Account' },
  { href: '/orders', label: 'My Orders', current: true },
] as const;

/** Neutral product thumb when Catalog has no match for the line productId. */
const THUMB_FALLBACK =
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop';

const PLACED_AT_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * Map Alloy list filters ↔ Gateway `OrderStatus`.
 * `shipped` is presentation-only until fulfillment exists → `confirmed`.
 */
export function toApiOrderStatus(filter: OrderStatusFilter): ApiOrderStatus | undefined {
  switch (filter) {
    case 'processing':
      return 'pending';
    case 'shipped':
      return 'confirmed';
    case 'delivered':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'all':
    default:
      return undefined;
  }
}

export function toOrderListStatus(apiStatus: string): OrderListStatus {
  switch (apiStatus) {
    case 'pending':
      return 'processing';
    case 'confirmed':
      return 'shipped';
    case 'completed':
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'processing';
  }
}

export function formatOrderPlacedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return PLACED_AT_FORMATTER.format(date);
}

function resolveThumbnails(order: OrderDto): OrderListItemViewModel['thumbnails'] {
  const catalog = new Map(catalogProducts.map((product) => [product.id, product]));
  return order.lines.slice(0, 3).map((line) => {
    const product = catalog.get(line.productId);
    return {
      src: product?.imageUrl ?? THUMB_FALLBACK,
      alt: product?.name ?? 'Ordered item',
    };
  });
}

function itemCount(order: OrderDto): number {
  if (order.lines.length > 0) {
    return order.lines.reduce((sum, line) => sum + line.quantity, 0);
  }
  return order.lineCount;
}

export function mapOrderToListItem(order: OrderDto): OrderListItemViewModel {
  return {
    orderNumber: order.orderNumber,
    placedAtLabel: formatOrderPlacedAt(order.createdAt),
    itemCount: itemCount(order),
    total: order.totalAmount,
    currency: order.totalCurrency || 'USD',
    status: toOrderListStatus(order.status),
    thumbnails: resolveThumbnails(order),
  };
}

export function mapOrderListToPageViewModel(
  dto: OrderListDto,
  query: OrdersQuery,
): OrderListPageViewModel {
  const totalPages = Math.max(1, Math.ceil(dto.total / (dto.pageSize || ORDER_PAGE_SIZE)) || 1);

  return {
    crumbs: LIST_CRUMBS,
    status: query.status,
    page: dto.page,
    totalPages: dto.total === 0 ? 1 : totalPages,
    total: dto.total,
    items: dto.items.map(mapOrderToListItem),
  };
}
