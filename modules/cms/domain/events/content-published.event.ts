import type { DomainEvent } from '@novacommerce/building-blocks';

export type ContentPublishedPayload = Record<string, never>;

export class ContentPublishedEvent implements DomainEvent {
  readonly eventName = 'ContentPublished';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ContentPublishedPayload,
  ) {}
}
