import type { DomainEvent } from '@novacommerce/building-blocks';

export interface CartItemAddedPayload { readonly productId: string; readonly quantity: number }

export class CartItemAddedEvent implements DomainEvent {
  readonly eventName = 'CartItemAdded';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CartItemAddedPayload,
  ) {}
}
