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
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private code: CouponCode,
    private promotionId: string,
    private dateRange: DateRange,
    private maxRedemptions: number,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    id: string,
    code: CouponCode,
    promotionId: string,
    dateRange: DateRange,
    maxRedemptions: number,
  ): Result<Coupon, PromotionDomainError> {
    if (!promotionId?.trim()) {
      return Result.fail(new PromotionDomainError('Promotion id is required', 'INVALID_PROMOTION_ID'));
    }
    if (maxRedemptions <= 0) {
      return Result.fail(new PromotionDomainError('Max redemptions must be positive', 'INVALID_MAX_REDEMPTIONS'));
    }
    return Result.ok(
      new Coupon(id, new Date(), new Date(), code, promotionId.trim(), dateRange, maxRedemptions),
    );
  }

  static reconstitute(props: {
    id: string;
    code: CouponCode;
    promotionId: string;
    dateRange: DateRange;
    maxRedemptions: number;
    createdAt: Date;
    updatedAt: Date;
    redemptions: CouponRedemption[];
  }): Coupon {
    const coupon = new Coupon(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.code,
      props.promotionId,
      props.dateRange,
      props.maxRedemptions,
    );
    coupon.redemptions = [...props.redemptions];
    return coupon;
  }

  ensureValid(at: Date = new Date()): Result<void, PromotionDomainError> {
    if (!this.dateRange.contains(at)) {
      return Result.fail(new PromotionDomainError('Coupon is not valid for current date', 'COUPON_EXPIRED'));
    }
    if (this.redemptions.length >= this.maxRedemptions) {
      return Result.fail(new PromotionDomainError('Coupon redemption limit reached', 'COUPON_LIMIT_REACHED'));
    }
    return Result.ok(undefined);
  }

  apply(orderId: string): Result<void, PromotionDomainError> {
    const validation = this.ensureValid();
    if (validation.isFailure) {
      return validation;
    }

    this.updatedAt = new Date();
    this.addDomainEvent(
      new CouponAppliedEvent(this.id, new Date(), { couponCode: this.code.value, orderId }),
    );
    return Result.ok(undefined);
  }

  use(orderId: string, customerId: string, redemptionId: string): Result<void, PromotionDomainError> {
    if (!orderId?.trim()) {
      return Result.fail(new PromotionDomainError('Order id is required', 'INVALID_ORDER_ID'));
    }
    if (!customerId?.trim()) {
      return Result.fail(new PromotionDomainError('Customer id is required', 'INVALID_CUSTOMER_ID'));
    }
    if (this.redemptions.some((redemption) => redemption.getOrderId() === orderId.trim())) {
      return Result.fail(new PromotionDomainError('Coupon already used for order', 'COUPON_ALREADY_USED'));
    }

    const validation = this.ensureValid();
    if (validation.isFailure) {
      return validation;
    }

    this.redemptions.push(CouponRedemption.create(redemptionId, orderId.trim(), customerId.trim()));
    this.updatedAt = new Date();
    this.addDomainEvent(
      new CouponUsedEvent(this.id, new Date(), { couponCode: this.code.value, orderId: orderId.trim() }),
    );
    return Result.ok(undefined);
  }

  getCode(): CouponCode {
    return this.code;
  }

  getPromotionId(): string {
    return this.promotionId;
  }

  getDateRange(): DateRange {
    return this.dateRange;
  }

  getMaxRedemptions(): number {
    return this.maxRedemptions;
  }

  getRedemptions(): readonly CouponRedemption[] {
    return this.redemptions;
  }

  getRemainingRedemptions(): number {
    return Math.max(0, this.maxRedemptions - this.redemptions.length);
  }
}
