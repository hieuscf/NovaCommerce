import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { PromotionDomainError } from '../errors/promotion-domain.error';
import { PromotionBenefit } from '../entities/promotion-benefit';
import { PromotionRule } from '../entities/promotion-rule';
import { PromotionActivatedEvent } from '../events/promotion-activated.event';
import { PromotionDeactivatedEvent } from '../events/promotion-deactivated.event';
import type { DateRange } from '../value-objects/date-range';

export class Promotion extends AggregateRoot<string> {
  private rules: PromotionRule[] = [];
  private benefits: PromotionBenefit[] = [];
  private active = false;

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private name: string, private dateRange: DateRange,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, name: string, dateRange: DateRange): Result<Promotion, PromotionDomainError> {
    if (!name?.trim()) {
      return Result.fail(new PromotionDomainError('Promotion name is required', 'INVALID_PROMOTION_NAME'));
    }
    return Result.ok(new Promotion(id, new Date(), new Date(), name.trim(), dateRange));
  }

  static reconstitute(props: {
    id: string; name: string; dateRange: DateRange; active: boolean;
    createdAt: Date; updatedAt: Date; rules: PromotionRule[]; benefits: PromotionBenefit[];
  }): Promotion {
    const promotion = new Promotion(props.id, props.createdAt, props.updatedAt, props.name, props.dateRange);
    promotion.active = props.active;
    promotion.rules = [...props.rules];
    promotion.benefits = [...props.benefits];
    return promotion;
  }

  activate(): Result<void, PromotionDomainError> {
    if (this.active) {
      return Result.fail(new PromotionDomainError('Promotion is already active', 'PROMOTION_ALREADY_ACTIVE'));
    }
    this.active = true;
    this.updatedAt = new Date();
    this.addDomainEvent(new PromotionActivatedEvent(this.id, new Date(), { promotionId: this.id }));
    return Result.ok(undefined);
  }

  deactivate(): Result<void, PromotionDomainError> {
    if (!this.active) {
      return Result.fail(new PromotionDomainError('Promotion is not active', 'PROMOTION_NOT_ACTIVE'));
    }
    this.active = false;
    this.updatedAt = new Date();
    this.addDomainEvent(new PromotionDeactivatedEvent(this.id, new Date(), { promotionId: this.id }));
    return Result.ok(undefined);
  }

  getName(): string {
    return this.name;
  }

  isActive(): boolean {
    return this.active;
  }

  getDateRange(): DateRange {
    return this.dateRange;
  }

  getRules(): readonly PromotionRule[] {
    return this.rules;
  }

  getBenefits(): readonly PromotionBenefit[] {
    return this.benefits;
  }

  ensureApplicable(at: Date, subtotalAmount: number): Result<void, PromotionDomainError> {
    if (!this.active) {
      return Result.fail(new PromotionDomainError('Promotion is not active', 'PROMOTION_NOT_ACTIVE'));
    }
    if (!this.dateRange.contains(at)) {
      return Result.fail(new PromotionDomainError('Promotion is not valid for current date', 'PROMOTION_EXPIRED'));
    }
    for (const rule of this.rules) {
      if (!rule.isEligible({ subtotalAmount })) {
        return Result.fail(new PromotionDomainError('Promotion rules are not satisfied', 'PROMOTION_RULE_NOT_SATISFIED'));
      }
    }
    return Result.ok(undefined);
  }

  calculateDiscount(subtotalAmount: number): Result<number, PromotionDomainError> {
    if (this.benefits.length === 0) {
      return Result.fail(new PromotionDomainError('Promotion has no benefits', 'PROMOTION_NO_BENEFITS'));
    }

    const discountAmount = this.benefits.reduce(
      (total, benefit) => total + benefit.calculateDiscount(subtotalAmount),
      0,
    );

    return Result.ok(Math.min(subtotalAmount, discountAmount));
  }
}
