import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ReturnRequestedPayload {
  readonly returnRequestId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly paymentId: string;
}

export class ReturnRequestedEvent implements DomainEvent {
  readonly eventName = 'ReturnRequested';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ReturnRequestedPayload,
  ) {}
}
