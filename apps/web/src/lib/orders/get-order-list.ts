import { catalogProducts } from '@/lib/mock-data/catalog';
import { orderFixtures, type OrderFixture, type OrderFixtureLine } from '@/lib/mock-data/orders';
import { CART_DISPLAY_TAX_RATE, roundMoney } from '@/lib/view-models/cart';
import {
  ORDER_PAGE_SIZE,
  formatOrderNumber,
  normalizeOrderNumber,
  type OrderDetailViewModel,
  type OrderItemViewModel,
  type OrderListItemViewModel,
  type OrderListPageViewModel,
  type OrderSummaryViewModel,
} from '@/lib/view-models/order';
import type { ProductViewModel } from '@/lib/view-models/product';
import type { OrdersQuery } from '@/lib/url/orders-query';

const LIST_CRUMBS = [
  { href: '/', label: 'Home' },
  { href: '/account', label: 'My Account' },
  { href: '/orders', label: 'My Orders', current: true },
] as const;

function productsById(): Map<string, ProductViewModel> {
  return new Map(catalogProducts.map((product) => [product.id, product]));
}

function toItem(
  fixture: OrderFixture,
  line: OrderFixtureLine,
  index: number,
  product: ProductViewModel,
): OrderItemViewModel {
  return {
    id: `${fixture.orderNumber}-line-${index + 1}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    variantLabel: line.variantLabel,
    imageUrl: product.imageUrl,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    lineTotal: roundMoney(line.unitPrice * line.quantity),
    currency: product.currency,
  };
}

function resolveItems(fixture: OrderFixture): OrderItemViewModel[] {
  const catalog = productsById();
  return fixture.lines.flatMap((line, index) => {
    const product = catalog.get(line.productId);
    return product ? [toItem(fixture, line, index, product)] : [];
  });
}

function summarize(fixture: OrderFixture, items: readonly OrderItemViewModel[]): OrderSummaryViewModel {
  const currency = items[0]?.currency ?? 'USD';
  if (fixture.summary) {
    return {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: fixture.summary.subtotal,
      shipping: fixture.summary.shipping,
      tax: fixture.summary.tax,
      total: fixture.summary.total,
      currency: fixture.summary.currency ?? currency,
      taxRatePercent: fixture.summary.taxRatePercent,
    };
  }

  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const tax = roundMoney(subtotal * CART_DISPLAY_TAX_RATE);
  const shipping = 0;

  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shipping,
    tax,
    total: roundMoney(subtotal + shipping + tax),
    currency,
    taxRatePercent: Math.round(CART_DISPLAY_TAX_RATE * 100),
  };
}

function toListItem(fixture: OrderFixture): OrderListItemViewModel | undefined {
  const items = resolveItems(fixture);
  if (items.length === 0) {
    return undefined;
  }

  const summary = summarize(fixture, items);
  return {
    orderNumber: fixture.orderNumber,
    placedAtLabel: fixture.placedAtLabel.split('•')[0]?.trim() ?? fixture.placedAtLabel,
    itemCount: summary.itemCount,
    total: summary.total,
    currency: summary.currency,
    status: fixture.status,
    thumbnails: items.map((item) => ({ src: item.imageUrl, alt: item.name })),
  };
}

/**
 * Presentation lookup for the customer order list. Replace with an Order
 * Gateway adapter later. Missing catalog products are skipped. Unexpected
 * failures must throw so `orders/error.tsx` can render the order error state.
 */
export function getOrderListPage(query: OrdersQuery): OrderListPageViewModel {
  const items = orderFixtures.flatMap((fixture) => {
    const item = toListItem(fixture);
    return item ? [item] : [];
  });
  const filtered =
    query.status === 'all' ? items : items.filter((item) => item.status === query.status);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDER_PAGE_SIZE) || 1);
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * ORDER_PAGE_SIZE;

  return {
    crumbs: LIST_CRUMBS,
    status: query.status,
    page,
    totalPages: filtered.length === 0 ? 1 : totalPages,
    total: filtered.length,
    items: filtered.slice(start, start + ORDER_PAGE_SIZE),
  };
}

export function getOrderFixture(orderNumber: string): OrderFixture | undefined {
  const normalized = normalizeOrderNumber(orderNumber);
  return orderFixtures.find((fixture) => fixture.orderNumber === normalized);
}

export function toOrderDetail(fixture: OrderFixture): OrderDetailViewModel | undefined {
  const items = resolveItems(fixture);
  if (items.length === 0) {
    return undefined;
  }

  return {
    orderNumber: fixture.orderNumber,
    placedAtLabel: fixture.placedAtLabel,
    status: fixture.status,
    timeline: fixture.timeline,
    items,
    shipping: fixture.shipping,
    address: fixture.address,
    payment: fixture.payment,
    summary: summarize(fixture, items),
    crumbs: [
      { href: '/', label: 'Home' },
      { href: '/orders', label: 'My Orders' },
      {
        href: `/orders/${fixture.orderNumber}`,
        label: `Order ${formatOrderNumber(fixture.orderNumber)}`,
        current: true,
      },
    ],
  };
}
