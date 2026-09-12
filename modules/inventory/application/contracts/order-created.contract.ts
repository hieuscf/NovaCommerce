import { isIntegrationEvent, type BusEvent } from '@novacommerce/building-blocks';

export interface OrderCreatedLineContract {
  readonly sku: string;
  readonly quantity: number;
  readonly warehouseId: string;
}

/** Inventory-side contract for OrderCreated — P0 fields plus reservation lines. */
export interface OrderCreatedInventoryContract {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly lines: readonly OrderCreatedLineContract[];
}

function isOrderCreatedLine(value: unknown): value is OrderCreatedLineContract {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const line = value as Record<string, unknown>;
  return (
    typeof line.sku === 'string' &&
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    typeof line.warehouseId === 'string'
  );
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

export function parseOrderCreatedInventoryContract(
  event: BusEvent,
): OrderCreatedInventoryContract | null {
  if (!isOrderCreatedEvent(event)) {
    return null;
  }

  const payload = readEventPayload(event);

  if (typeof payload.orderNumber !== 'string' || typeof payload.customerId !== 'string') {
    return null;
  }

  const rawLines = Array.isArray(payload.lines) ? payload.lines : [];
  const lines = rawLines.filter(isOrderCreatedLine);
  if (lines.length === 0) {
    return null;
  }

  return {
    orderId: readAggregateId(event),
    orderNumber: payload.orderNumber,
    customerId: payload.customerId,
    lines,
  };
}
