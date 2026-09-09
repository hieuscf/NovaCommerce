import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ProductCreatedPayload { readonly name: string; readonly slug: string }

export class ProductCreatedEvent implements DomainEvent {
  readonly eventName = 'ProductCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ProductCreatedPayload,
  ) {}
}
