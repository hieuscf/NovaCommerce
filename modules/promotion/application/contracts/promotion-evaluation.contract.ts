import type { Result } from '@novacommerce/building-blocks';
import type { PromotionApplicationError } from '../errors/promotion-application.error';

export interface PromotionEvaluationRequest {
  readonly couponCode?: string;
  readonly subtotalAmount: number;
  readonly currency: string;
  readonly customerId: string;
}

export interface PromotionEvaluationResult {
  readonly discountAmount: number;
  readonly currency: string;
  readonly label: string;
  readonly couponCode: string;
}

export interface IPromotionEvaluationService {
  evaluate(
    request: PromotionEvaluationRequest,
  ): Promise<Result<PromotionEvaluationResult | null, PromotionApplicationError>>;
}
