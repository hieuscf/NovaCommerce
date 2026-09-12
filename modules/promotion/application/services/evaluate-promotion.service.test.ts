import { Result } from '@novacommerce/building-blocks';
import { describe, expect, it, vi } from 'vitest';
import { CalculateDiscountHandler } from '../handlers/calculate-discount.handler';
import { EvaluatePromotionService } from './evaluate-promotion.service';

describe('EvaluatePromotionService', () => {
  it('returns null when coupon code is omitted', async () => {
    const service = new EvaluatePromotionService({
      execute: vi.fn(),
    } as unknown as CalculateDiscountHandler);

    const result = await service.evaluate({
      subtotalAmount: 100,
      currency: 'USD',
      customerId: '11111111-1111-1111-1111-111111111111',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeNull();
  });

  it('delegates discount calculation to handler', async () => {
    const handler = {
      execute: vi.fn().mockResolvedValue(
        Result.ok({
          couponCode: 'SAVE10',
          discountAmount: 20,
          currency: 'USD',
          label: 'Coupon SAVE10',
        }),
      ),
    } as unknown as CalculateDiscountHandler;

    const service = new EvaluatePromotionService(handler);
    const result = await service.evaluate({
      couponCode: 'SAVE10',
      subtotalAmount: 200,
      currency: 'USD',
      customerId: '11111111-1111-1111-1111-111111111111',
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
