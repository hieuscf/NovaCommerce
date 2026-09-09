import { ValueObject } from '@novacommerce/building-blocks';
import { PaymentDomainError } from '../errors/payment-domain.error';

export class Money extends ValueObject<{ amount: number; currency: string }> {
  private constructor(props: { amount: number; currency: string }) {
    super(props);
  }

  static create(amount: number, currency: string): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new PaymentDomainError('Amount must be non-negative', 'INVALID_MONEY_AMOUNT');
    }
    const normalizedCurrency = currency?.trim().toUpperCase();
    if (!normalizedCurrency || normalizedCurrency.length !== 3) {
      throw new PaymentDomainError('Currency must be a 3-letter ISO code', 'INVALID_MONEY_CURRENCY');
    }
    return new Money({ amount, currency: normalizedCurrency });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }
}
