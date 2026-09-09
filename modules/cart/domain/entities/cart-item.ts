import { BaseEntity } from '@novacommerce/building-blocks';
import type { Money } from '../value-objects/money';
import type { ProductReference } from '../value-objects/product-reference';
import type { Quantity } from '../value-objects/quantity';

export class CartItem extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private productReference: ProductReference,
    private quantity: Quantity,
    private unitPrice: Money,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, productReference: ProductReference, quantity: Quantity, unitPrice: Money): CartItem {
    return new CartItem(id, new Date(), new Date(), productReference, quantity, unitPrice);
  }

  updateQuantity(quantity: Quantity): void { this.quantity = quantity; this.updatedAt = new Date(); }
  getProductReference(): ProductReference { return this.productReference; }
  getQuantity(): Quantity { return this.quantity; }
  getUnitPrice(): Money { return this.unitPrice; }
}
