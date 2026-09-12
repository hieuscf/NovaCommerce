import { describe, expect, it } from 'vitest';
import { PromotionBenefit } from './promotion-benefit';

describe('PromotionBenefit', () => {
  it('calculates percentage discount', () => {
    const benefit = PromotionBenefit.create('11111111-1111-1111-1111-111111111111', 'percentage', 10);
    expect(benefit.calculateDiscount(200)).toBe(20);
  });

  it('calculates fixed discount', () => {
    const benefit = PromotionBenefit.create('11111111-1111-1111-1111-111111111111', 'fixed', 15);
    expect(benefit.calculateDiscount(200)).toBe(15);
  });
});
