import type { DomainEvent } from '@novacommerce/building-blocks';

export interface CartItemRemovedPayload { readonly itemId: string }

export class CartItemRemovedEvent implements DomainEvent {
  readonly eventName = 'CartItemRemoved';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CartItemRemovedPayload,
  ) {}
}
