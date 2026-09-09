import { BaseEntity } from '@novacommerce/building-blocks';

export class OrderPaymentReference extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private paymentId: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, paymentId: string): OrderPaymentReference {
    return new OrderPaymentReference(id, new Date(), new Date(), paymentId);
  }

  getPaymentId(): string { return this.paymentId; }
}
