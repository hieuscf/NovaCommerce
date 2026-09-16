import type { DomainEvent } from '@novacommerce/building-blocks';
import type { ProductEventPayload } from './product-event.payload';

export type ProductCreatedPayload = ProductEventPayload;

export class ProductCreatedEvent implements DomainEvent {
  readonly eventName = 'ProductCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ProductCreatedPayload,
  ) {}
}
