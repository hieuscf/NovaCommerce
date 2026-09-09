import type { DomainEvent } from '@novacommerce/building-blocks';

export type ContentUpdatedPayload = Record<string, never>;

export class ContentUpdatedEvent implements DomainEvent {
  readonly eventName = 'ContentUpdated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ContentUpdatedPayload,
  ) {}
}
