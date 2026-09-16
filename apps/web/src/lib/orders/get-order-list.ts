import { catalogProducts } from '@/lib/mock-data/catalog';
import { orderFixtures, type OrderFixture, type OrderFixtureLine } from '@/lib/mock-data/orders';
import { CART_DISPLAY_TAX_RATE, roundMoney } from '@/lib/view-models/cart';
import {
  ORDER_PAGE_SIZE,
  formatOrderNumber,
  normalizeOrderNumber,
  type OrderDetailViewModel,
  type OrderItemViewModel,
  type OrderListPageViewModel,
  type OrderSummaryViewModel,
} from '@/lib/view-models/order';
import type { ProductViewModel } from '@/lib/view-models/product';
import type { OrdersQuery } from '@/lib/url/orders-query';
import { orderClient } from './client';
import { mapOrderListToPageViewModel, toApiOrderStatus } from './mappers';

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

/**
 * Loads the customer order list from Gateway `GET /users/me/orders`.
 * Unexpected failures must throw so the orders error UI can recover.
 */
export async function getOrderListPage(query: OrdersQuery): Promise<OrderListPageViewModel> {
  const dto = await orderClient.getOrderHistory({
    page: query.page,
    pageSize: ORDER_PAGE_SIZE,
    status: toApiOrderStatus(query.status),
  });
  return mapOrderListToPageViewModel(dto, query);
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
