import type { DomainEvent } from '@novacommerce/building-blocks';

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

export function parseOrderCreatedInventoryContract(
  event: DomainEvent,
): OrderCreatedInventoryContract | null {
  if (event.eventName !== 'OrderCreated') {
    return null;
  }

  const payload =
    'payload' in event && typeof (event as { payload: unknown }).payload === 'object'
      ? ((event as { payload: Record<string, unknown> }).payload ?? {})
      : {};

  if (typeof payload.orderNumber !== 'string' || typeof payload.customerId !== 'string') {
    return null;
  }

  const rawLines = Array.isArray(payload.lines) ? payload.lines : [];
  const lines = rawLines.filter(isOrderCreatedLine);
  if (lines.length === 0) {
    return null;
  }

  return {
    orderId: event.aggregateId,
    orderNumber: payload.orderNumber,
    customerId: payload.customerId,
    lines,
  };
}
