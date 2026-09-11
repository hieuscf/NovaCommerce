import { BaseEntity } from '@novacommerce/building-blocks';
import { Provider } from '../value-objects/provider';

export class ExternalIdentity extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private readonly provider: Provider,
    private readonly externalUserId: string,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, provider: Provider, externalUserId: string): ExternalIdentity {
    return new ExternalIdentity(id, new Date(), new Date(), provider, externalUserId);
  }

  static reconstitute(props: {
    id: string;
    providerName: string;
    providerExternalId?: string;
    createdAt: Date;
    updatedAt: Date;
  }): ExternalIdentity {
    return new ExternalIdentity(
      props.id,
      props.createdAt,
      props.updatedAt,
      Provider.create(props.providerName, props.providerExternalId),
      props.providerExternalId ?? props.providerName,
    );
  }

  getProvider(): Provider { return this.provider; }
  getExternalUserId(): string { return this.externalUserId; }
}
