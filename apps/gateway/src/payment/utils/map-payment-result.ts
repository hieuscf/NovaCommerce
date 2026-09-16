import {
  ConflictException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { PaymentApplicationError } from '../../../../../modules/payment/application/errors/payment-application.error';

export function mapPaymentResult<T>(
  result: Result<T, PaymentApplicationError>,
  _successStatus = HttpStatus.OK,
): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'PAYMENT_ALREADY_SUCCEEDED':
    case 'PAYMENT_ALREADY_FAILED':
    case 'PAYMENT_ALREADY_REFUNDED':
    case 'PAYMENT_NOT_CONFIRMABLE':
    case 'PAYMENT_NOT_REFUNDABLE':
      throw new ConflictException(error.message);
    case 'PAYMENT_NOT_FOUND':
    case 'PAYMENT_METHOD_NOT_FOUND':
    case 'USER_NOT_FOUND':
      throw new NotFoundException(error.message);
    case 'CVV_NOT_ALLOWED':
      throw new UnprocessableEntityException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
