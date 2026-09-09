import type { DomainEvent } from '@novacommerce/building-blocks';

export interface CheckoutCompletedPayload { readonly orderId: string }

export class CheckoutCompletedEvent implements DomainEvent {
  readonly eventName = 'CheckoutCompleted';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CheckoutCompletedPayload,
  ) {}
}
