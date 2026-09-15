import { orderFixtures } from '@/lib/mock-data/orders';
import { getOrderFixture, toOrderDetail } from '@/lib/orders/get-order-list';
import { normalizeOrderNumber, type OrderDetailViewModel } from '@/lib/view-models/order';

/**
 * Presentation lookup for a customer order detail page. Replace with an Order
 * Gateway adapter later. Unknown order numbers return `undefined` (route
 * `not-found`). Unexpected failures must throw so `orders/[orderNumber]/error.tsx`
 * can render the order error state.
 */
export function getOrderDetail(orderNumber: string): OrderDetailViewModel | undefined {
  const fixture = getOrderFixture(normalizeOrderNumber(orderNumber));
  if (!fixture) {
    return undefined;
  }

  return toOrderDetail(fixture);
}

export function listOrderNumbers(): readonly string[] {
  return orderFixtures.map((fixture) => fixture.orderNumber);
}
