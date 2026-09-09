import { ValueObject } from '@novacommerce/building-blocks';
import { ReviewDomainError } from '../errors/review-domain.error';

export class Rating extends ValueObject<{ value: number }> {
  private constructor(props: { value: number }) {
    super(props);
  }

  static create(value: number): Rating {
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      throw new ReviewDomainError('Rating must be between 1 and 5', 'INVALID_RATING');
    }
    return new Rating({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
