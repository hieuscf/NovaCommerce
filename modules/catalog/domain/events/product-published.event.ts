import type { DomainEvent } from '@novacommerce/building-blocks';

export type ProductPublishedPayload = Record<string, never>;

export class ProductPublishedEvent implements DomainEvent {
  readonly eventName = 'ProductPublished';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ProductPublishedPayload,
  ) {}
}
