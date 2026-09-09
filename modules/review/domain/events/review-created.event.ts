import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ReviewCreatedPayload { readonly productId: string; readonly rating: number }

export class ReviewCreatedEvent implements DomainEvent {
  readonly eventName = 'ReviewCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ReviewCreatedPayload,
  ) {}
}
