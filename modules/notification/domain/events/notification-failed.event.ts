import type { DomainEvent } from '@novacommerce/building-blocks';

export interface NotificationFailedPayload { readonly reason: string }

export class NotificationFailedEvent implements DomainEvent {
  readonly eventName = 'NotificationFailed';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: NotificationFailedPayload,
  ) {}
}
