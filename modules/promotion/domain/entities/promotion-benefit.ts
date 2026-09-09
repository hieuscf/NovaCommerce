import { BaseEntity } from '@novacommerce/building-blocks';

export class PromotionBenefit extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private benefitType: string, private value: number) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, benefitType: string, value: number): PromotionBenefit {
    return new PromotionBenefit(id, new Date(), new Date(), benefitType, value);
  }

  getBenefitType(): string { return this.benefitType; }
  getValue(): number { return this.value; }
}
