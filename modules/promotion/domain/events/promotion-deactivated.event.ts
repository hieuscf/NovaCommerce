import type { DomainEvent } from '@novacommerce/building-blocks';

export interface PromotionDeactivatedPayload { readonly promotionId: string }

export class PromotionDeactivatedEvent implements DomainEvent {
  readonly eventName = 'PromotionDeactivated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: PromotionDeactivatedPayload,
  ) {}
}
