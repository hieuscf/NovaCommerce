import type { DomainEvent } from '@novacommerce/building-blocks';

export interface PaymentFailedPayload { readonly reason: string }

export class PaymentFailedEvent implements DomainEvent {
  readonly eventName = 'PaymentFailed';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: PaymentFailedPayload,
  ) {}
}
