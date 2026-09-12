import { ConflictException, HttpStatus, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { ReturnRefundApplicationError } from '../../../../../modules/return-refund/application/errors/return-refund-application.error';

export function mapReturnRefundResult<T>(
  result: Result<T, ReturnRefundApplicationError>,
  successStatus = HttpStatus.OK,
): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'RETURN_NOT_FOUND':
    case 'ORDER_NOT_FOUND':
    case 'PAYMENT_NOT_FOUND':
      throw new NotFoundException(error.message);
    case 'RETURN_ALREADY_EXISTS':
    case 'INVALID_RETURN_STATUS':
      throw new ConflictException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
