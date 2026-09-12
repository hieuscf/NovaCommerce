import { describe, expect, it, vi } from 'vitest';
import { Coupon } from '../../domain/aggregates/coupon';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import { DateRange } from '../../domain/value-objects/date-range';
import { UseCouponHandler } from './use-coupon.handler';

describe('UseCouponHandler', () => {
  const dateRange = DateRange.create(new Date('2026-01-01T00:00:00.000Z'), new Date('2026-12-31T23:59:59.999Z'));

  it('records coupon usage and persists coupon', async () => {
    const coupon = Coupon.create(
      '11111111-1111-1111-1111-111111111111',
      CouponCode.create('SAVE10'),
      '22222222-2222-2222-2222-222222222222',
      dateRange,
      2,
    ).getValue();

    const save = vi.fn();
    const handler = new UseCouponHandler({
      findByCode: vi.fn().mockResolvedValue(coupon),
      save,
    });

    const result = await handler.execute({
      couponCode: 'SAVE10',
      orderId: '33333333-3333-3333-3333-333333333333',
      customerId: '44444444-4444-4444-4444-444444444444',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().remainingRedemptions).toBe(1);
    expect(save).toHaveBeenCalledOnce();
  });
});
