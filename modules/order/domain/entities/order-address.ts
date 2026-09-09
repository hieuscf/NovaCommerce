import { BaseEntity } from '@novacommerce/building-blocks';
import type { Address } from '../value-objects/address';

export class OrderAddress extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private type: string, private address: Address) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, type: string, address: Address): OrderAddress {
    return new OrderAddress(id, new Date(), new Date(), type, address);
  }

  getType(): string { return this.type; }
  getAddress(): Address { return this.address; }
}
