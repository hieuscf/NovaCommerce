import type { DomainEvent } from '@novacommerce/building-blocks';

export interface CheckoutStartedPayload { readonly cartId: string; readonly customerId?: string }

export class CheckoutStartedEvent implements DomainEvent {
  readonly eventName = 'CheckoutStarted';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CheckoutStartedPayload,
  ) {}
}
