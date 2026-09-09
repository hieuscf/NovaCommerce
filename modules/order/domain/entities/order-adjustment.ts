import { BaseEntity } from '@novacommerce/building-blocks';
import type { Money } from '../value-objects/money';

export class OrderAdjustment extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private label: string, private amount: Money) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, label: string, amount: Money): OrderAdjustment {
    return new OrderAdjustment(id, new Date(), new Date(), label, amount);
  }

  getLabel(): string { return this.label; }
  getAmount(): Money { return this.amount; }
}
