import { BaseEntity } from '@novacommerce/building-blocks';

export class UserPreference extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private key: string,
    private value: string,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, key: string, value: string): UserPreference {
    return new UserPreference(id, new Date(), new Date(), key, value);
  }

  getKey(): string { return this.key; }
  getValue(): string { return this.value; }
}
