import { describe, expect, it } from 'vitest';
import { CouponAppliedEvent } from '../events/coupon-applied.event';
import { CouponUsedEvent } from '../events/coupon-used.event';
import { CouponCode } from '../value-objects/coupon-code';
import { DateRange } from '../value-objects/date-range';
import { Coupon } from './coupon';

describe('Coupon aggregate', () => {
  const couponId = '11111111-1111-1111-1111-111111111111';
  const promotionId = '22222222-2222-2222-2222-222222222222';
  const orderId = '33333333-3333-3333-3333-333333333333';
  const customerId = '44444444-4444-4444-4444-444444444444';
  const dateRange = DateRange.create(new Date('2026-01-01T00:00:00.000Z'), new Date('2026-12-31T23:59:59.999Z'));
  const code = CouponCode.create('SAVE10');

  function createCoupon(maxRedemptions = 2) {
    return Coupon.create(couponId, code, promotionId, dateRange, maxRedemptions);
  }

  it('creates coupon with valid properties', () => {
    const result = createCoupon();
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().getCode().value).toBe('SAVE10');
  });

  it('rejects invalid max redemptions', () => {
    const result = Coupon.create(couponId, code, promotionId, dateRange, 0);
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_MAX_REDEMPTIONS');
  });

  it('validates coupon date range and usage limits', () => {
    const coupon = Coupon.reconstitute({
      id: couponId,
      code,
      promotionId,
      dateRange,
      maxRedemptions: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      redemptions: [],
    });

    expect(coupon.ensureValid(new Date('2026-06-01T00:00:00.000Z')).isSuccess).toBe(true);
    expect(coupon.ensureValid(new Date('2027-01-01T00:00:00.000Z')).isFailure).toBe(true);

    coupon.use(orderId, customerId, '55555555-5555-5555-5555-555555555555');
    expect(coupon.ensureValid(new Date('2026-06-01T00:00:00.000Z')).isFailure).toBe(true);
    expect(coupon.getRemainingRedemptions()).toBe(0);
  });

  it('applies coupon and emits CouponApplied event', () => {
    const coupon = createCoupon().getValue();
    const result = coupon.apply(orderId);

    expect(result.isSuccess).toBe(true);
    const events = coupon.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(CouponAppliedEvent);
    expect((events[0] as CouponAppliedEvent).payload.orderId).toBe(orderId);
  });

  it('uses coupon and emits CouponUsed event', () => {
    const coupon = createCoupon().getValue();
    const result = coupon.use(orderId, customerId, '55555555-5555-5555-5555-555555555555');

    expect(result.isSuccess).toBe(true);
    const events = coupon.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(CouponUsedEvent);
    expect((events[0] as CouponUsedEvent).payload.couponCode).toBe('SAVE10');
    expect((events[0] as CouponUsedEvent).payload.orderId).toBe(orderId);
  });

  it('rejects duplicate coupon usage for the same order', () => {
    const coupon = createCoupon().getValue();
    coupon.use(orderId, customerId, '55555555-5555-5555-5555-555555555555');
    coupon.pullDomainEvents();

    const result = coupon.use(orderId, customerId, '66666666-6666-6666-6666-666666666666');
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('COUPON_ALREADY_USED');
  });
});
