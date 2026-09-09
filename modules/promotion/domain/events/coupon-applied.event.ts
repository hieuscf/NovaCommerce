import type { DomainEvent } from '@novacommerce/building-blocks';

export interface CouponAppliedPayload { readonly couponCode: string; readonly orderId: string }

export class CouponAppliedEvent implements DomainEvent {
  readonly eventName = 'CouponApplied';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: CouponAppliedPayload,
  ) {}
}
