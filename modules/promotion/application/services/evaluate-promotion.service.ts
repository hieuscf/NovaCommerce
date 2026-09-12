import { Result } from '@novacommerce/building-blocks';
import type { ICouponRepository } from '../../domain/repositories/i-coupon-repository';
import type { IPromotionRepository } from '../../domain/repositories/i-promotion-repository';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import type {
  IPromotionEvaluationService,
  PromotionEvaluationRequest,
  PromotionEvaluationResult,
} from '../contracts/promotion-evaluation.contract';
import { PromotionApplicationError } from '../errors/promotion-application.error';

function calculateDiscountAmount(
  benefitType: string,
  benefitValue: number,
  subtotalAmount: number,
): number {
  if (benefitType === 'percentage') {
    return Math.min(subtotalAmount, (subtotalAmount * benefitValue) / 100);
  }
  if (benefitType === 'fixed') {
    return Math.min(subtotalAmount, benefitValue);
  }
  return 0;
}

export class EvaluatePromotionService implements IPromotionEvaluationService {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  async evaluate(
    request: PromotionEvaluationRequest,
  ): Promise<Result<PromotionEvaluationResult | null, PromotionApplicationError>> {
    if (!request.couponCode?.trim()) {
      return Result.ok(null);
    }

    try {
      const couponCode = CouponCode.create(request.couponCode);
      const coupon = await this.couponRepository.findByCode(couponCode);
      if (!coupon) {
        return Result.fail(new PromotionApplicationError('Coupon not found', 'COUPON_NOT_FOUND'));
      }

      const applyResult = coupon.apply('');
      if (applyResult.isFailure) {
        return Result.fail(
          new PromotionApplicationError(applyResult.getError().message, applyResult.getError().code),
        );
      }

      const promotion = await this.promotionRepository.findById(coupon.getPromotionId());
      if (!promotion) {
        return Result.fail(new PromotionApplicationError('Promotion not found', 'PROMOTION_NOT_FOUND'));
      }

      if (!promotion.isActive()) {
        return Result.fail(new PromotionApplicationError('Promotion is not active', 'PROMOTION_NOT_ACTIVE'));
      }

      if (!promotion.getDateRange().contains(new Date())) {
        return Result.fail(new PromotionApplicationError('Promotion is not valid for current date', 'PROMOTION_EXPIRED'));
      }

      const benefits = promotion.getBenefits();
      if (benefits.length === 0) {
        return Result.fail(new PromotionApplicationError('Promotion has no benefits', 'PROMOTION_NO_BENEFITS'));
      }

      const primaryBenefit = benefits[0];
      const discountAmount = calculateDiscountAmount(
        primaryBenefit.getBenefitType(),
        primaryBenefit.getValue(),
        request.subtotalAmount,
      );

      if (discountAmount <= 0) {
        return Result.ok(null);
      }

      return Result.ok({
        discountAmount,
        currency: request.currency,
        label: `Coupon ${coupon.getCode().value}`,
        couponCode: coupon.getCode().value,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to evaluate promotion';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'PROMOTION_EVALUATION_FAILED';
      return Result.fail(new PromotionApplicationError(message, code));
    }
  }
}
