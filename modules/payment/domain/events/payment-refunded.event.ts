import type { DomainEvent } from '@novacommerce/building-blocks';

export interface PaymentRefundedPayload { readonly amount: number; readonly currency: string }

export class PaymentRefundedEvent implements DomainEvent {
  readonly eventName = 'PaymentRefunded';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: PaymentRefundedPayload,
  ) {}
}
