import type { DomainEvent } from '@novacommerce/building-blocks';

export interface CouponUsedPayload { readonly couponCode: string; readonly orderId: string }

export class CouponUsedEvent implements DomainEvent {
  readonly eventName = 'CouponUsed';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CouponUsedPayload,
  ) {}
}
