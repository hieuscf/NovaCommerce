import type { DomainEvent } from '@novacommerce/building-blocks';

export interface PaymentInitiatedPayload { readonly orderId: string; readonly amount: number; readonly currency: string }

export class PaymentInitiatedEvent implements DomainEvent {
  readonly eventName = 'PaymentInitiated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: PaymentInitiatedPayload,
  ) {}
}
