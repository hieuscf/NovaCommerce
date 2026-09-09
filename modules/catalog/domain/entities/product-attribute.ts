import { BaseEntity } from '@novacommerce/building-blocks';

export class ProductAttribute extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private name: string, private value: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, name: string, value: string): ProductAttribute {
    return new ProductAttribute(id, new Date(), new Date(), name, value);
  }

  getName(): string { return this.name; }
  getValue(): string { return this.value; }
}
