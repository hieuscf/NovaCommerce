import { describe, expect, it } from 'vitest';
import { PromotionBenefit } from '../entities/promotion-benefit';
import { PromotionRule } from '../entities/promotion-rule';
import { PromotionActivatedEvent } from '../events/promotion-activated.event';
import { PromotionDeactivatedEvent } from '../events/promotion-deactivated.event';
import { DateRange } from '../value-objects/date-range';
import { Promotion } from './promotion';

describe('Promotion aggregate', () => {
  const promotionId = '11111111-1111-1111-1111-111111111111';
  const dateRange = DateRange.create(new Date('2026-01-01T00:00:00.000Z'), new Date('2026-12-31T23:59:59.999Z'));

  function createPromotion() {
    return Promotion.create(promotionId, 'Spring Sale', dateRange);
  }

  it('creates promotion with valid name', () => {
    const result = createPromotion();
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().getName()).toBe('Spring Sale');
  });

  it('rejects empty promotion name', () => {
    const result = Promotion.create(promotionId, '   ', dateRange);
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_PROMOTION_NAME');
  });

  it('activates and deactivates promotion with domain events', () => {
    const promotion = createPromotion().getValue();

    const activateResult = promotion.activate();
    expect(activateResult.isSuccess).toBe(true);
    expect(promotion.isActive()).toBe(true);

    let events = promotion.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PromotionActivatedEvent);

    const deactivateResult = promotion.deactivate();
    expect(deactivateResult.isSuccess).toBe(true);

    events = promotion.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PromotionDeactivatedEvent);
  });

  it('ensures promotion applicability with rules and date range', () => {
    const promotion = Promotion.reconstitute({
      id: promotionId,
      name: 'Spring Sale',
      dateRange,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: [PromotionRule.create('22222222-2222-2222-2222-222222222222', 'min_order_total', { minAmount: '100' })],
      benefits: [PromotionBenefit.create('33333333-3333-3333-3333-333333333333', 'percentage', 10)],
    });

    expect(
      promotion.ensureApplicable(new Date('2026-06-01T00:00:00.000Z'), 150).isSuccess,
    ).toBe(true);
    expect(
      promotion.ensureApplicable(new Date('2026-06-01T00:00:00.000Z'), 50).isFailure,
    ).toBe(true);
    expect(
      promotion.ensureApplicable(new Date('2027-01-01T00:00:00.000Z'), 150).isFailure,
    ).toBe(true);
  });

  it('calculates discount from benefits', () => {
    const promotion = Promotion.reconstitute({
      id: promotionId,
      name: 'Spring Sale',
      dateRange,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: [],
      benefits: [PromotionBenefit.create('33333333-3333-3333-3333-333333333333', 'percentage', 10)],
    });

    const result = promotion.calculateDiscount(200);
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(20);
  });
});
