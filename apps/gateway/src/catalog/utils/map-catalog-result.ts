import {
  ConflictException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { CatalogApplicationError } from '../../../../../modules/catalog/application/errors/catalog-application.error';

export function mapCatalogResult<T>(result: Result<T, CatalogApplicationError>, successStatus = HttpStatus.OK): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'DUPLICATE_SLUG':
    case 'DUPLICATE_VARIANT_SKU':
    case 'PRODUCT_ALREADY_PUBLISHED':
    case 'PRODUCT_ALREADY_ARCHIVED':
      throw new ConflictException(error.message);
    case 'PRODUCT_NOT_FOUND':
    case 'CATEGORY_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
