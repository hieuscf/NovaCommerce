import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ReturnRejectedPayload {
  readonly returnRequestId: string;
  readonly orderId: string;
}

export class ReturnRejectedEvent implements DomainEvent {
  readonly eventName = 'ReturnRejected';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ReturnRejectedPayload,
  ) {}
}
