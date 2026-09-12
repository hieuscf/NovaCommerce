import { BaseEntity } from '@novacommerce/building-blocks';
import type { Money } from '../value-objects/money';
import type { ProviderReference } from '../value-objects/provider-reference';

export class PaymentTransaction extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private amount: Money, private providerReference: ProviderReference,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, amount: Money, providerReference: ProviderReference): PaymentTransaction {
    return new PaymentTransaction(id, new Date(), new Date(), amount, providerReference);
  }

  static reconstitute(props: {
    id: string;
    amount: Money;
    providerReference: ProviderReference;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentTransaction {
    return new PaymentTransaction(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.amount,
      props.providerReference,
    );
  }

  getAmount(): Money { return this.amount; }
  getProviderReference(): ProviderReference { return this.providerReference; }
}
