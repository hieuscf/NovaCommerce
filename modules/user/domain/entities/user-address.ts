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
    return new UserAddress(id, new Date(), new Date(), label.trim(), address, isDefault);
  }

  static reconstitute(props: {
    id: string;
    label: string;
    address: Address;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserAddress {
    return new UserAddress(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.label,
      props.address,
      props.isDefault,
    );
  }

  update(label: string, address: Address): void {
    this.label = label.trim();
    this.address = address;
    this.updatedAt = new Date();
  }

  markDefault(): void {
    this.isDefault = true;
    this.updatedAt = new Date();
  }

  clearDefault(): void {
    this.isDefault = false;
    this.updatedAt = new Date();
  }

  getLabel(): string {
    return this.label;
  }

  getAddress(): Address {
    return this.address;
  }

  isDefaultAddress(): boolean {
    return this.isDefault;
  }
}
