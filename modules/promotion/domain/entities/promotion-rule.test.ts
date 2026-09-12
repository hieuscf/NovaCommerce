import { describe, expect, it } from 'vitest';
import { PromotionRule } from './promotion-rule';

describe('PromotionRule', () => {
  it('checks minimum order total eligibility', () => {
    const rule = PromotionRule.create('11111111-1111-1111-1111-111111111111', 'min_order_total', {
      minAmount: '100',
    });

    expect(rule.isEligible({ subtotalAmount: 150 })).toBe(true);
    expect(rule.isEligible({ subtotalAmount: 50 })).toBe(false);
  });
});
