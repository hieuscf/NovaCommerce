import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { PromotionDomainError } from '../errors/promotion-domain.error';
import { CouponRedemption } from '../entities/coupon-redemption';
import { CouponAppliedEvent } from '../events/coupon-applied.event';
import { CouponUsedEvent } from '../events/coupon-used.event';
import type { CouponCode } from '../value-objects/coupon-code';
import type { DateRange } from '../value-objects/date-range';

export class Coupon extends AggregateRoot<string> {
  private redemptions: CouponRedemption[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private code: CouponCode, private promotionId: string,
    private dateRange: DateRange, private maxRedemptions: number,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, code: CouponCode, promotionId: string, dateRange: DateRange, maxRedemptions: number): Result<Coupon, PromotionDomainError> {
    if (!promotionId?.trim()) {
      return Result.fail(new PromotionDomainError('Promotion id is required', 'INVALID_PROMOTION_ID'));
    }
    if (maxRedemptions <= 0) {
      return Result.fail(new PromotionDomainError('Max redemptions must be positive', 'INVALID_MAX_REDEMPTIONS'));
    }
    return Result.ok(new Coupon(id, new Date(), new Date(), code, promotionId.trim(), dateRange, maxRedemptions));
  }

  static reconstitute(props: {
    id: string; code: CouponCode; promotionId: string; dateRange: DateRange; maxRedemptions: number;
    createdAt: Date; updatedAt: Date; redemptions: CouponRedemption[];
  }): Coupon {
    const coupon = new Coupon(props.id, props.createdAt, props.updatedAt, props.code, props.promotionId, props.dateRange, props.maxRedemptions);
    coupon.redemptions = [...props.redemptions];
    return coupon;
  }

  apply(orderId: string): Result<void, PromotionDomainError> {
    if (!this.dateRange.contains(new Date())) {
      return Result.fail(new PromotionDomainError('Coupon is not valid for current date', 'COUPON_EXPIRED'));
    }
    this.updatedAt = new Date();
    this.addDomainEvent(new CouponAppliedEvent(this.id, new Date(), { couponCode: this.code.value, orderId }));
    return Result.ok(undefined);
  }

  use(orderId: string, customerId: string, redemptionId: string): Result<void, PromotionDomainError> {
    if (this.redemptions.length >= this.maxRedemptions) {
      return Result.fail(new PromotionDomainError('Coupon redemption limit reached', 'COUPON_LIMIT_REACHED'));
    }
    this.redemptions.push(CouponRedemption.create(redemptionId, orderId, customerId));
    this.updatedAt = new Date();
    this.addDomainEvent(new CouponUsedEvent(this.id, new Date(), { couponCode: this.code.value, orderId }));
    return Result.ok(undefined);
  }

  getCode(): CouponCode { return this.code; }
  getRedemptions(): readonly CouponRedemption[] { return this.redemptions; }
}
