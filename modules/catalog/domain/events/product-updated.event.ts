import type { DomainEvent } from '@novacommerce/building-blocks';
import type { ProductEventPayload } from './product-event.payload';

export type ProductUpdatedPayload = ProductEventPayload;

export class ProductUpdatedEvent implements DomainEvent {
  readonly eventName = 'ProductUpdated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ProductUpdatedPayload,
  ) {}
}
