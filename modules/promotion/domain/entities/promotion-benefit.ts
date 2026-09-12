import { BaseEntity } from '@novacommerce/building-blocks';

export const PROMOTION_BENEFIT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export type PromotionBenefitType = (typeof PROMOTION_BENEFIT_TYPES)[keyof typeof PROMOTION_BENEFIT_TYPES];

export class PromotionBenefit extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private benefitType: string,
    private value: number,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, benefitType: string, value: number): PromotionBenefit {
    return new PromotionBenefit(id, new Date(), new Date(), benefitType, value);
  }

  getBenefitType(): string {
    return this.benefitType;
  }

  getValue(): number {
    return this.value;
  }

  calculateDiscount(subtotalAmount: number): number {
    if (this.benefitType === PROMOTION_BENEFIT_TYPES.PERCENTAGE) {
      return (subtotalAmount * this.value) / 100;
    }
    if (this.benefitType === PROMOTION_BENEFIT_TYPES.FIXED) {
      return this.value;
    }
    return 0;
  }
}
