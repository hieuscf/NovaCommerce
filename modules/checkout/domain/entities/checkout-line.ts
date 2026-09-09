import { BaseEntity } from '@novacommerce/building-blocks';

export class CheckoutLine extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private productId: string, private variantId: string | undefined,
    private quantity: number, private unitPriceAmount: number, private currency: string,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, productId: string, quantity: number, unitPriceAmount: number, currency: string, variantId?: string): CheckoutLine {
    return new CheckoutLine(id, new Date(), new Date(), productId, variantId, quantity, unitPriceAmount, currency);
  }

  getProductId(): string { return this.productId; }
  getVariantId(): string | undefined { return this.variantId; }
  getQuantity(): number { return this.quantity; }
  getUnitPriceAmount(): number { return this.unitPriceAmount; }
  getCurrency(): string { return this.currency; }
}
