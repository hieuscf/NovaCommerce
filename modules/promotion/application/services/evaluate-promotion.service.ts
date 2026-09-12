import { Result } from '@novacommerce/building-blocks';
import type {
  IPromotionEvaluationService,
  PromotionEvaluationRequest,
  PromotionEvaluationResult,
} from '../contracts/promotion-evaluation.contract';
import { PromotionApplicationError } from '../errors/promotion-application.error';
import { CalculateDiscountHandler } from '../handlers/calculate-discount.handler';

export class EvaluatePromotionService implements IPromotionEvaluationService {
  constructor(private readonly calculateDiscountHandler: CalculateDiscountHandler) {}

  async evaluate(
    request: PromotionEvaluationRequest,
  ): Promise<Result<PromotionEvaluationResult | null, PromotionApplicationError>> {
    if (!request.couponCode?.trim()) {
      return Result.ok(null);
    }

    const result = await this.calculateDiscountHandler.execute({
      couponCode: request.couponCode,
      subtotalAmount: request.subtotalAmount,
      currency: request.currency,
      customerId: request.customerId,
    });

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const discount = result.getValue();
    if (!discount) {
      return Result.ok(null);
    }

    return Result.ok({
      discountAmount: discount.discountAmount,
      currency: discount.currency,
      label: discount.label,
      couponCode: discount.couponCode,
    });
  }
}
