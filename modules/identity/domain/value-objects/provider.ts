import { ValueObject } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';

export class Provider extends ValueObject<{ name: string; externalId?: string }> {
  private constructor(props: { name: string; externalId?: string }) {
    super(props);
  }

  static create(name: string, externalId?: string): Provider {
    if (!name?.trim()) {
      throw new IdentityDomainError('Provider name is required', 'INVALID_PROVIDER');
    }
    return new Provider({ name: name.trim().toLowerCase(), externalId: externalId?.trim() });
  }

  get name(): string { return this.props.name; }
  get externalId(): string | undefined { return this.props.externalId; }
}
