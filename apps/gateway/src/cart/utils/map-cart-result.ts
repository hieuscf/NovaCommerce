import { HttpStatus, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { CartApplicationError } from '../../../../../modules/cart/application/errors/cart-application.error';

export function mapCartResult<T>(result: Result<T, CartApplicationError>, successStatus = HttpStatus.OK): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'USER_NOT_FOUND':
    case 'CART_ITEM_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
