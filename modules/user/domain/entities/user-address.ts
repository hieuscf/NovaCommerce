import { BaseEntity } from '@novacommerce/building-blocks';
import type { Address } from '../value-objects/address';

export class UserAddress extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private label: string,
    private address: Address,
    private isDefault: boolean,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, label: string, address: Address, isDefault = false): UserAddress {
    return new UserAddress(id, new Date(), new Date(), label, address, isDefault);
  }

  getLabel(): string { return this.label; }
  getAddress(): Address { return this.address; }
  isDefaultAddress(): boolean { return this.isDefault; }
}
