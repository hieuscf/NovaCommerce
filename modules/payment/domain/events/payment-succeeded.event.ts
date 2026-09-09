import type { DomainEvent } from '@novacommerce/building-blocks';

export interface PaymentSucceededPayload { readonly orderId: string }

export class PaymentSucceededEvent implements DomainEvent {
  readonly eventName = 'PaymentSucceeded';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: PaymentSucceededPayload,
  ) {}
}
