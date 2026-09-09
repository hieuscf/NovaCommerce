import { BaseEntity } from '@novacommerce/building-blocks';

export class PromotionRule extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private ruleType: string, private config: Record<string, string>) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, ruleType: string, config: Record<string, string>): PromotionRule {
    return new PromotionRule(id, new Date(), new Date(), ruleType, { ...config });
  }

  getRuleType(): string { return this.ruleType; }
  getConfig(): Record<string, string> { return { ...this.config }; }
}
