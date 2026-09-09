import type { Coupon } from '../aggregates/coupon';
import type { CouponCode } from '../value-objects/coupon-code';

export interface ICouponRepository {
  findByCode(code: CouponCode): Promise<Coupon | null>;
  save(coupon: Coupon): Promise<void>;
}
