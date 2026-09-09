import type { DomainEvent } from '@novacommerce/building-blocks';

export type OrderConfirmedPayload = Record<string, never>;

export class OrderConfirmedEvent implements DomainEvent {
  readonly eventName = 'OrderConfirmed';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: OrderConfirmedPayload,
  ) {}
}
