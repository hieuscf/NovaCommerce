import { isIntegrationEvent, type BusEvent } from '@novacommerce/building-blocks';

export interface OrderCreatedNotificationContract {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly customerId: string;
}

function isOrderCreatedEvent(event: BusEvent): boolean {
  if (isIntegrationEvent(event)) {
    return event.eventType === 'order.created';
  }

  return event.eventName === 'OrderCreated';
}

function readEventPayload(event: BusEvent): Record<string, unknown> {
  if (isIntegrationEvent(event)) {
    return event.payload ?? {};
  }

  if ('payload' in event && typeof event.payload === 'object' && event.payload !== null) {
    return event.payload as Record<string, unknown>;
  }

  return {};
}

function readAggregateId(event: BusEvent): string {
  if (isIntegrationEvent(event)) {
    return event.aggregateId;
  }

  return event.aggregateId;
}

export function parseOrderCreatedNotificationContract(
  event: BusEvent,
): OrderCreatedNotificationContract | null {
  if (!isOrderCreatedEvent(event)) {
    return null;
  }

  const payload = readEventPayload(event);

  if (typeof payload.orderNumber !== 'string' || typeof payload.customerId !== 'string') {
    return null;
  }

  return {
    orderId: readAggregateId(event),
    orderNumber: payload.orderNumber,
    customerId: payload.customerId,
  };
}
