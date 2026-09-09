import { ValueObject } from '@novacommerce/building-blocks';
import { PromotionDomainError } from '../errors/promotion-domain.error';

export class Percentage extends ValueObject<{ value: number }> {
  private constructor(props: { value: number }) {
    super(props);
  }

  static create(value: number): Percentage {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new PromotionDomainError('Percentage must be between 0 and 100', 'INVALID_PERCENTAGE');
    }
    return new Percentage({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
