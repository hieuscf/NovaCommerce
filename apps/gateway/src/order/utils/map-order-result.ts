import { HttpStatus, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { OrderApplicationError } from '../../../../../modules/order/application/errors/order-application.error';

export function mapOrderResult<T>(result: Result<T, OrderApplicationError>, successStatus = HttpStatus.OK): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'USER_NOT_FOUND':
    case 'ORDER_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
