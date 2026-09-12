import {
  ConflictException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { ShippingApplicationError } from '../../../../../modules/shipping/application/errors/shipping-application.error';

export function mapShippingResult<T>(
  result: Result<T, ShippingApplicationError>,
  successStatus = HttpStatus.OK,
): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'SHIPMENT_ALREADY_EXISTS':
    case 'INVALID_SHIPMENT_STATE':
    case 'SHIPMENT_ALREADY_DELIVERED':
      throw new ConflictException(error.message);
    case 'SHIPMENT_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
