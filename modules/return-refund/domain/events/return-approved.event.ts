import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ReturnApprovedPayload {
  readonly returnRequestId: string;
  readonly orderId: string;
}

export class ReturnApprovedEvent implements DomainEvent {
  readonly eventName = 'ReturnApproved';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ReturnApprovedPayload,
  ) {}
}
