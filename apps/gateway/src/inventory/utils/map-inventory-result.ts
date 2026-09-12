import {
  ConflictException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { InventoryApplicationError } from '../../../../../modules/inventory/application/errors/inventory-application.error';

export function mapInventoryResult<T>(
  result: Result<T, InventoryApplicationError>,
  successStatus = HttpStatus.OK,
): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'DUPLICATE_ITEM':
      throw new ConflictException(error.message);
    case 'INVENTORY_ITEM_NOT_FOUND':
    case 'RESERVATION_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
