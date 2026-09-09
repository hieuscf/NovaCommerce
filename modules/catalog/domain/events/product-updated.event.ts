import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ProductUpdatedPayload { readonly name: string }

export class ProductUpdatedEvent implements DomainEvent {
  readonly eventName = 'ProductUpdated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ProductUpdatedPayload,
  ) {}
}
