import { BaseEntity } from '@novacommerce/building-blocks';
import type { PreferenceKey } from '../value-objects/preference-key';

export class UserPreference extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private key: PreferenceKey,
    private value: string,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, key: PreferenceKey, value: string): UserPreference {
    return new UserPreference(id, new Date(), new Date(), key, value.trim());
  }

  static reconstitute(props: {
    id: string;
    key: PreferenceKey;
    value: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserPreference {
    return new UserPreference(props.id, props.createdAt, props.updatedAt, props.key, props.value);
  }

  updateValue(value: string): void {
    this.value = value.trim();
    this.updatedAt = new Date();
  }

  getKey(): PreferenceKey {
    return this.key;
  }

  getValue(): string {
    return this.value;
  }
}
