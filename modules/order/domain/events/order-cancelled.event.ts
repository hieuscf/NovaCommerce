import type { DomainEvent } from '@novacommerce/building-blocks';

export type OrderCancelledPayload = Record<string, never>;

export class OrderCancelledEvent implements DomainEvent {
  readonly eventName = 'OrderCancelled';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: OrderCancelledPayload,
  ) {}
}
