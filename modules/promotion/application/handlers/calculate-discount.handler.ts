import { Result } from '@novacommerce/building-blocks';
import type { DiscountCalculationResponseDto } from '../dto/promotion-response.dto';
import { PromotionApplicationError } from '../errors/promotion-application.error';
import { PromotionContextService } from '../services/promotion-context.service';

export interface CalculateDiscountCommand {
  readonly couponCode: string;
  readonly subtotalAmount: number;
  readonly currency: string;
  readonly customerId: string;
}

export class CalculateDiscountHandler {
  constructor(private readonly promotionContextService: PromotionContextService) {}

  async execute(
    command: CalculateDiscountCommand,
  ): Promise<Result<DiscountCalculationResponseDto | null, PromotionApplicationError>> {
    if (!command.currency?.trim()) {
      return Result.fail(new PromotionApplicationError('Currency is required', 'INVALID_CURRENCY'));
    }
    if (!Number.isFinite(command.subtotalAmount) || command.subtotalAmount < 0) {
      return Result.fail(new PromotionApplicationError('Subtotal amount must be non-negative', 'INVALID_SUBTOTAL'));
    }

    const contextResult = await this.promotionContextService.resolve(command.couponCode, command.subtotalAmount);
    if (contextResult.isFailure) {
      return Result.fail(contextResult.getError());
    }

    const { coupon, promotion } = contextResult.getValue();
    const discountResult = promotion.calculateDiscount(command.subtotalAmount);
    if (discountResult.isFailure) {
      return Result.fail(
        new PromotionApplicationError(discountResult.getError().message, discountResult.getError().code),
      );
    }

    const discountAmount = discountResult.getValue();
    if (discountAmount <= 0) {
      return Result.ok(null);
    }

    return Result.ok({
      couponCode: coupon.getCode().value,
      discountAmount,
      currency: command.currency.trim().toUpperCase(),
      label: `Coupon ${coupon.getCode().value}`,
    });
  }
}
