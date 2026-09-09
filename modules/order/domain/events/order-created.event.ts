import type { DomainEvent } from '@novacommerce/building-blocks';

export interface OrderCreatedPayload { readonly orderNumber: string; readonly customerId: string }

export class OrderCreatedEvent implements DomainEvent {
  readonly eventName = 'OrderCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: OrderCreatedPayload,
  ) {}
}
