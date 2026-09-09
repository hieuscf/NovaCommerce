import { BaseEntity } from '@novacommerce/building-blocks';
import type { Money } from '../value-objects/money';
import type { Quantity } from '../value-objects/quantity';

export class OrderLine extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private productId: string, private variantId: string | undefined,
    private quantity: Quantity, private unitPrice: Money,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, productId: string, quantity: Quantity, unitPrice: Money, variantId?: string): OrderLine {
    return new OrderLine(id, new Date(), new Date(), productId, variantId, quantity, unitPrice);
  }

  getProductId(): string { return this.productId; }
  getVariantId(): string | undefined { return this.variantId; }
  getQuantity(): Quantity { return this.quantity; }
  getUnitPrice(): Money { return this.unitPrice; }
}
