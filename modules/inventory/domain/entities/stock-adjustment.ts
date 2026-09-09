import { BaseEntity } from '@novacommerce/building-blocks';
import type { Quantity } from '../value-objects/quantity';

export class StockAdjustment extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private delta: Quantity, private reason: string,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, delta: Quantity, reason: string): StockAdjustment {
    return new StockAdjustment(id, new Date(), new Date(), delta, reason);
  }

  getDelta(): Quantity { return this.delta; }
  getReason(): string { return this.reason; }
}
