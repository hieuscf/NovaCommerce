import type { DomainEvent } from '@novacommerce/building-blocks';

export type CartCreatedPayload = Record<string, never>;

export class CartCreatedEvent implements DomainEvent {
  readonly eventName = 'CartCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CartCreatedPayload,
  ) {}
}
