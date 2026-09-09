import type { DomainEvent } from '@novacommerce/building-blocks';

export interface NotificationSentPayload { readonly deliveryId: string }

export class NotificationSentEvent implements DomainEvent {
  readonly eventName = 'NotificationSent';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: NotificationSentPayload,
  ) {}
}
