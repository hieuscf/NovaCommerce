import { BaseEntity } from '@novacommerce/building-blocks';

export const PROMOTION_RULE_TYPES = {
  MIN_ORDER_TOTAL: 'min_order_total',
} as const;

export type PromotionRuleType = (typeof PROMOTION_RULE_TYPES)[keyof typeof PROMOTION_RULE_TYPES];

export interface PromotionRuleContext {
  readonly subtotalAmount: number;
}

export class PromotionRule extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private ruleType: string,
    private config: Record<string, string>,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, ruleType: string, config: Record<string, string>): PromotionRule {
    return new PromotionRule(id, new Date(), new Date(), ruleType, { ...config });
  }

  getRuleType(): string {
    return this.ruleType;
  }

  getConfig(): Record<string, string> {
    return { ...this.config };
  }

  isEligible(context: PromotionRuleContext): boolean {
    if (this.ruleType === PROMOTION_RULE_TYPES.MIN_ORDER_TOTAL) {
      const minAmount = Number(this.config.minAmount ?? this.config.min_amount ?? '0');
      return Number.isFinite(minAmount) && context.subtotalAmount >= minAmount;
    }
    return true;
  }
}
