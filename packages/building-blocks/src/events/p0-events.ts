import type { IntegrationEvent } from './integration-event';
import { P0_EVENT_VERSION, type P0IntegrationEventType } from './event-type-registry';

export interface OrderCreatedV1Payload {
  readonly orderNumber: string;
  readonly customerId: string;
}

export interface StockReservedV1Payload {
  readonly orderId: string;
  readonly quantity: number;
}

export interface PaymentSucceededV1Payload {
  readonly orderId: string;
}

export interface ProductUpdatedV1Payload {
  readonly name: string;
}

export interface CartItemAddedV1Payload {
  readonly productId: string;
  readonly quantity: number;
}

export interface CheckoutCompletedV1Payload {
  readonly orderId: string;
}

export type OrderCreatedV1 = IntegrationEvent<OrderCreatedV1Payload> & {
  readonly eventType: 'order.created';
  readonly eventVersion: 1;
  readonly aggregateType: 'Order';
};

export type StockReservedV1 = IntegrationEvent<StockReservedV1Payload> & {
  readonly eventType: 'inventory.stock_reserved';
  readonly eventVersion: 1;
  readonly aggregateType: 'InventoryItem';
};

export type PaymentSucceededV1 = IntegrationEvent<PaymentSucceededV1Payload> & {
  readonly eventType: 'payment.completed';
  readonly eventVersion: 1;
  readonly aggregateType: 'Payment';
};

export type ProductUpdatedV1 = IntegrationEvent<ProductUpdatedV1Payload> & {
  readonly eventType: 'catalog.product_updated';
  readonly eventVersion: 1;
  readonly aggregateType: 'Product';
};

export type CartItemAddedV1 = IntegrationEvent<CartItemAddedV1Payload> & {
  readonly eventType: 'cart.item_added';
  readonly eventVersion: 1;
  readonly aggregateType: 'Cart';
};

export type CheckoutCompletedV1 = IntegrationEvent<CheckoutCompletedV1Payload> & {
  readonly eventType: 'checkout.completed';
  readonly eventVersion: 1;
  readonly aggregateType: 'CheckoutSession';
};

export type P0IntegrationEvent =
  | OrderCreatedV1
  | StockReservedV1
  | PaymentSucceededV1
  | ProductUpdatedV1
  | CartItemAddedV1
  | CheckoutCompletedV1;

const P0_PAYLOAD_VALIDATORS: Record<
  P0IntegrationEventType,
  (payload: Record<string, unknown>) => boolean
> = {
  'order.created': (payload) =>
    typeof payload.orderNumber === 'string' &&
    typeof payload.customerId === 'string',
  'inventory.stock_reserved': (payload) =>
    typeof payload.orderId === 'string' && typeof payload.quantity === 'number',
  'payment.completed': (payload) => typeof payload.orderId === 'string',
  'catalog.product_updated': (payload) => typeof payload.name === 'string',
  'cart.item_added': (payload) =>
    typeof payload.productId === 'string' && typeof payload.quantity === 'number',
  'checkout.completed': (payload) => typeof payload.orderId === 'string',
};

export function validateP0EventPayload(
  eventType: P0IntegrationEventType,
  payload: Record<string, unknown>,
): boolean {
  return P0_PAYLOAD_VALIDATORS[eventType](payload);
}
