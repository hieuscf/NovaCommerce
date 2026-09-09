import { ValueObject } from '@novacommerce/building-blocks';
import { ReviewDomainError } from '../errors/review-domain.error';

export class ReviewText extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): ReviewText {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length > 5000) throw new ReviewDomainError('Invalid review text', 'INVALID_REVIEW_TEXT');
    return new ReviewText({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
