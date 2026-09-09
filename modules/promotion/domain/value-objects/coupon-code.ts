import { ValueObject } from '@novacommerce/building-blocks';
import { PromotionDomainError } from '../errors/promotion-domain.error';

export class CouponCode extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): CouponCode {
    const trimmed = value?.trim();
    if (!trimmed) throw new PromotionDomainError('Coupon code is required', 'INVALID_COUPON_CODE');
    return new CouponCode({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
