import { BaseEntity } from '@novacommerce/building-blocks';

export class ProductOption extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private name: string, private values: string[]) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, name: string, values: string[]): ProductOption {
    return new ProductOption(id, new Date(), new Date(), name, [...values]);
  }

  getName(): string { return this.name; }
  getValues(): readonly string[] { return this.values; }
}
