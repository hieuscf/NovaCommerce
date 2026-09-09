import { BaseEntity } from '@novacommerce/building-blocks';

export class OrderShipmentReference extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private shipmentId: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, shipmentId: string): OrderShipmentReference {
    return new OrderShipmentReference(id, new Date(), new Date(), shipmentId);
  }

  getShipmentId(): string { return this.shipmentId; }
}
