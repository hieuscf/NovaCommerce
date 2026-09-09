/**
 * Maps domain event names (PascalCase) to integration event types (dot notation).
 * See docs/event-catalog.md §3 and §12.
 */

export const DOMAIN_TO_INTEGRATION_EVENT_TYPE = {
  OrderCreated: 'order.created',
  StockReserved: 'inventory.stock_reserved',
  PaymentSucceeded: 'payment.completed',
  ProductUpdated: 'catalog.product_updated',
  CartItemAdded: 'cart.item_added',
  CheckoutCompleted: 'checkout.completed',
} as const;

export type P0DomainEventName = keyof typeof DOMAIN_TO_INTEGRATION_EVENT_TYPE;

export type P0IntegrationEventType =
  (typeof DOMAIN_TO_INTEGRATION_EVENT_TYPE)[P0DomainEventName];

export const P0_EVENT_VERSION = 1 as const;

export function toIntegrationEventType(domainEventName: string): string {
  const mapped =
    DOMAIN_TO_INTEGRATION_EVENT_TYPE[
      domainEventName as P0DomainEventName
    ];

  if (mapped) {
    return mapped;
  }

  return domainEventName
    .replace(/([a-z0-9])([A-Z])/g, '$1.$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1.$2')
    .toLowerCase();
}

export function isP0DomainEventName(name: string): name is P0DomainEventName {
  return name in DOMAIN_TO_INTEGRATION_EVENT_TYPE;
}

export function isP0IntegrationEventType(
  eventType: string,
): eventType is P0IntegrationEventType {
  return Object.values(DOMAIN_TO_INTEGRATION_EVENT_TYPE).includes(
    eventType as P0IntegrationEventType,
  );
}
