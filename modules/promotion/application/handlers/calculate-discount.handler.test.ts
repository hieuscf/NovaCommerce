import { describe, expect, it, vi } from 'vitest';
import { Coupon } from '../../domain/aggregates/coupon';
import { Promotion } from '../../domain/aggregates/promotion';
import { PromotionBenefit } from '../../domain/entities/promotion-benefit';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import { DateRange } from '../../domain/value-objects/date-range';
import { PromotionContextService } from '../services/promotion-context.service';
import { CalculateDiscountHandler } from './calculate-discount.handler';

describe('CalculateDiscountHandler', () => {
  const dateRange = DateRange.create(new Date('2026-01-01T00:00:00.000Z'), new Date('2026-12-31T23:59:59.999Z'));

  it('calculates discount for valid coupon', async () => {
    const coupon = Coupon.create(
      '11111111-1111-1111-1111-111111111111',
      CouponCode.create('SAVE10'),
      '22222222-2222-2222-2222-222222222222',
      dateRange,
      5,
    ).getValue();

    const promotion = Promotion.reconstitute({
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Spring Sale',
      dateRange,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: [],
      benefits: [PromotionBenefit.create('33333333-3333-3333-3333-333333333333', 'percentage', 10)],
    });

    const service = new PromotionContextService(
      {
        findByCode: vi.fn().mockResolvedValue(coupon),
        save: vi.fn(),
      },
      {
        findById: vi.fn().mockResolvedValue(promotion),
        save: vi.fn(),
      },
    );

    const handler = new CalculateDiscountHandler(service);
    const result = await handler.execute({
      couponCode: 'SAVE10',
      subtotalAmount: 200,
      currency: 'usd',
      customerId: '44444444-4444-4444-4444-444444444444',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      couponCode: 'SAVE10',
      discountAmount: 20,
      currency: 'USD',
      label: 'Coupon SAVE10',
    });
  });
});
