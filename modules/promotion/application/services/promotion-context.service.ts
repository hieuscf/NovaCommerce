import { Result } from '@novacommerce/building-blocks';
import type { Coupon } from '../../domain/aggregates/coupon';
import type { Promotion } from '../../domain/aggregates/promotion';
import type { ICouponRepository } from '../../domain/repositories/i-coupon-repository';
import type { IPromotionRepository } from '../../domain/repositories/i-promotion-repository';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import { PromotionApplicationError } from '../errors/promotion-application.error';

export interface ResolvedPromotionContext {
  readonly coupon: Coupon;
  readonly promotion: Promotion;
}

export class PromotionContextService {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  async resolve(
    couponCodeValue: string,
    subtotalAmount: number,
  ): Promise<Result<ResolvedPromotionContext, PromotionApplicationError>> {
    if (!couponCodeValue?.trim()) {
      return Result.fail(new PromotionApplicationError('Coupon code is required', 'INVALID_COUPON_CODE'));
    }

    try {
      const couponCode = CouponCode.create(couponCodeValue);
      const coupon = await this.couponRepository.findByCode(couponCode);
      if (!coupon) {
        return Result.fail(new PromotionApplicationError('Coupon not found', 'COUPON_NOT_FOUND'));
      }

      const couponValidation = coupon.ensureValid();
      if (couponValidation.isFailure) {
        return Result.fail(
          new PromotionApplicationError(couponValidation.getError().message, couponValidation.getError().code),
        );
      }

      const promotion = await this.promotionRepository.findById(coupon.getPromotionId());
      if (!promotion) {
        return Result.fail(new PromotionApplicationError('Promotion not found', 'PROMOTION_NOT_FOUND'));
      }

      const promotionValidation = promotion.ensureApplicable(new Date(), subtotalAmount);
      if (promotionValidation.isFailure) {
        return Result.fail(
          new PromotionApplicationError(promotionValidation.getError().message, promotionValidation.getError().code),
        );
      }

      return Result.ok({ coupon, promotion });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve promotion context';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'PROMOTION_CONTEXT_FAILED';
      return Result.fail(new PromotionApplicationError(message, code));
    }
  }
}
