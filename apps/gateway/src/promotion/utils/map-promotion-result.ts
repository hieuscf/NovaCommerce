import { HttpStatus, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { PromotionApplicationError } from '../../../../../modules/promotion/application/errors/promotion-application.error';

export function mapPromotionResult<T>(
  result: Result<T, PromotionApplicationError>,
  successStatus = HttpStatus.OK,
): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'COUPON_NOT_FOUND':
    case 'PROMOTION_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
