import type { DomainEvent } from '@novacommerce/building-blocks';

export type CartClearedPayload = Record<string, never>;

export class CartClearedEvent implements DomainEvent {
  readonly eventName = 'CartCleared';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CartClearedPayload,
  ) {}
}
