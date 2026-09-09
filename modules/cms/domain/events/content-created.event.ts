import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ContentCreatedPayload { readonly slug: string; readonly title: string }

export class ContentCreatedEvent implements DomainEvent {
  readonly eventName = 'ContentCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ContentCreatedPayload,
  ) {}
}
