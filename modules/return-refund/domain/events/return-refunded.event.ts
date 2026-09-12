import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ReturnRefundedPayload {
  readonly returnRequestId: string;
  readonly orderId: string;
  readonly paymentId: string;
  readonly amount: number;
  readonly currency: string;
}

export class ReturnRefundedEvent implements DomainEvent {
  readonly eventName = 'ReturnRefunded';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ReturnRefundedPayload,
  ) {}
}
