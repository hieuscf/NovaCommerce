import type { DomainEvent } from '@novacommerce/building-blocks';

export interface OrderCreatedLinePayload {
  readonly sku: string;
  readonly quantity: number;
  readonly warehouseId: string;
}

export interface OrderCreatedPayload {
  readonly orderNumber: string;
  readonly customerId: string;
  readonly lines?: readonly OrderCreatedLinePayload[];
}

export class OrderCreatedEvent implements DomainEvent {
  readonly eventName = 'OrderCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: OrderCreatedPayload,
  ) {}
}
