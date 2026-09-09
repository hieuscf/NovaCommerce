import { BaseEntity } from '@novacommerce/building-blocks';

export class ShipmentItem extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private orderLineId: string, private quantity: number,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, orderLineId: string, quantity: number): ShipmentItem {
    return new ShipmentItem(id, new Date(), new Date(), orderLineId, quantity);
  }

  getOrderLineId(): string { return this.orderLineId; }
  getQuantity(): number { return this.quantity; }
}
