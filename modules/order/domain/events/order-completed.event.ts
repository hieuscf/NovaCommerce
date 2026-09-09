import type { DomainEvent } from '@novacommerce/building-blocks';

export type OrderCompletedPayload = Record<string, never>;

export class OrderCompletedEvent implements DomainEvent {
  readonly eventName = 'OrderCompleted';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: OrderCompletedPayload,
  ) {}
}
