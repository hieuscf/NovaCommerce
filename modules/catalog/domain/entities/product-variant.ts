import { BaseEntity } from '@novacommerce/building-blocks';
import type { ProductSku } from '../value-objects/product-sku';
import type { Money } from '../value-objects/money';

export class ProductVariant extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private sku: ProductSku,
    private price: Money,
    private attributes: Record<string, string>,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, sku: ProductSku, price: Money, attributes: Record<string, string> = {}): ProductVariant {
    return new ProductVariant(id, new Date(), new Date(), sku, price, attributes);
  }

  getSku(): ProductSku { return this.sku; }
  getPrice(): Money { return this.price; }
  getAttributes(): Record<string, string> { return { ...this.attributes }; }
}
