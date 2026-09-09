import type { DomainEvent } from '@novacommerce/building-blocks';

export type ReviewUpdatedPayload = Record<string, never>;

export class ReviewUpdatedEvent implements DomainEvent {
  readonly eventName = 'ReviewUpdated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ReviewUpdatedPayload,
  ) {}
}
