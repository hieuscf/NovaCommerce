import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { ICouponRepository } from '../../domain/repositories/i-coupon-repository';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import type { CouponUsageResponseDto } from '../dto/promotion-response.dto';
import { PromotionApplicationError } from '../errors/promotion-application.error';

export interface UseCouponCommand {
  readonly couponCode: string;
  readonly orderId: string;
  readonly customerId: string;
}

export class UseCouponHandler {
  constructor(private readonly couponRepository: ICouponRepository) {}

  async execute(command: UseCouponCommand): Promise<Result<CouponUsageResponseDto, PromotionApplicationError>> {
    if (!command.couponCode?.trim()) {
      return Result.fail(new PromotionApplicationError('Coupon code is required', 'INVALID_COUPON_CODE'));
    }
    if (!command.orderId?.trim()) {
      return Result.fail(new PromotionApplicationError('Order id is required', 'INVALID_ORDER_ID'));
    }
    if (!command.customerId?.trim()) {
      return Result.fail(new PromotionApplicationError('Customer id is required', 'INVALID_CUSTOMER_ID'));
    }

    try {
      const couponCode = CouponCode.create(command.couponCode);
      const coupon = await this.couponRepository.findByCode(couponCode);
      if (!coupon) {
        return Result.fail(new PromotionApplicationError('Coupon not found', 'COUPON_NOT_FOUND'));
      }

      const useResult = coupon.use(command.orderId, command.customerId, randomUUID());
      if (useResult.isFailure) {
        return Result.fail(
          new PromotionApplicationError(useResult.getError().message, useResult.getError().code),
        );
      }

      await this.couponRepository.save(coupon);

      return Result.ok({
        couponCode: coupon.getCode().value,
        orderId: command.orderId.trim(),
        remainingRedemptions: coupon.getRemainingRedemptions(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to use coupon';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'USE_COUPON_FAILED';
      return Result.fail(new PromotionApplicationError(message, code));
    }
  }
}
