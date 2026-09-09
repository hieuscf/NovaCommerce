import type { DomainEvent } from '@novacommerce/building-blocks';

export type ReviewPublishedPayload = Record<string, never>;

export class ReviewPublishedEvent implements DomainEvent {
  readonly eventName = 'ReviewPublished';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ReviewPublishedPayload,
  ) {}
}
