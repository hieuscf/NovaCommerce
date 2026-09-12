import { Result } from '@novacommerce/building-blocks';
import type { CouponValidationResponseDto } from '../dto/promotion-response.dto';
import { PromotionApplicationError } from '../errors/promotion-application.error';
import { PromotionContextService } from '../services/promotion-context.service';

export interface ValidateCouponCommand {
  readonly couponCode: string;
  readonly subtotalAmount: number;
  readonly customerId: string;
}

export class ValidateCouponHandler {
  constructor(private readonly promotionContextService: PromotionContextService) {}

  async execute(
    command: ValidateCouponCommand,
  ): Promise<Result<CouponValidationResponseDto, PromotionApplicationError>> {
    const contextResult = await this.promotionContextService.resolve(command.couponCode, command.subtotalAmount);
    if (contextResult.isFailure) {
      return Result.fail(contextResult.getError());
    }

    const { coupon, promotion } = contextResult.getValue();

    return Result.ok({
      couponCode: coupon.getCode().value,
      promotionId: promotion.id,
      promotionName: promotion.getName(),
      remainingRedemptions: coupon.getRemainingRedemptions(),
    });
  }
}
