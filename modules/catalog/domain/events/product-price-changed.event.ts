import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ProductPriceChangedPayload { readonly amount: number; readonly currency: string }

export class ProductPriceChangedEvent implements DomainEvent {
  readonly eventName = 'ProductPriceChanged';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ProductPriceChangedPayload,
  ) {}
}
