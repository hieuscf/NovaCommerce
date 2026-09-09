import type { DomainEvent } from '@novacommerce/building-blocks';

export interface PromotionActivatedPayload { readonly promotionId: string }

export class PromotionActivatedEvent implements DomainEvent {
  readonly eventName = 'PromotionActivated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: PromotionActivatedPayload,
  ) {}
}
