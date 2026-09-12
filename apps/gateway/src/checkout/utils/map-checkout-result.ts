import { HttpStatus, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { CheckoutApplicationError } from '../../../../../modules/checkout/application/errors/checkout-application.error';

export function mapCheckoutResult<T>(result: Result<T, CheckoutApplicationError>, successStatus = HttpStatus.OK): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'USER_NOT_FOUND':
    case 'CHECKOUT_SESSION_NOT_FOUND':
    case 'SHIPPING_ADDRESS_NOT_FOUND':
    case 'PRODUCT_NOT_FOUND':
    case 'PRODUCT_VARIANT_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
