import { BaseEntity } from '@novacommerce/building-blocks';

export class CouponRedemption extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private orderId: string, private customerId: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, orderId: string, customerId: string): CouponRedemption {
    return new CouponRedemption(id, new Date(), new Date(), orderId, customerId);
  }

  getOrderId(): string { return this.orderId; }
  getCustomerId(): string { return this.customerId; }
}
