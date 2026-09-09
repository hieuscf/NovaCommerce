import type { DomainEvent } from '@novacommerce/building-blocks';

export interface NotificationRequestedPayload { readonly channel: string; readonly recipient: string; readonly template: string }

export class NotificationRequestedEvent implements DomainEvent {
  readonly eventName = 'NotificationRequested';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: NotificationRequestedPayload,
  ) {}
}
