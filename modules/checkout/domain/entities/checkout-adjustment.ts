import { BaseEntity } from '@novacommerce/building-blocks';

export enum CheckoutAdjustmentType { DISCOUNT = 'discount', SHIPPING = 'shipping', TAX = 'tax' }

export class CheckoutAdjustment extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private type: CheckoutAdjustmentType, private label: string,
    private amount: number, private currency: string,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, type: CheckoutAdjustmentType, label: string, amount: number, currency: string): CheckoutAdjustment {
    return new CheckoutAdjustment(id, new Date(), new Date(), type, label, amount, currency);
  }

  getType(): CheckoutAdjustmentType { return this.type; }
  getLabel(): string { return this.label; }
  getAmount(): number { return this.amount; }
  getCurrency(): string { return this.currency; }
}
