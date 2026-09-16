import {
  BadRequestException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { SearchApplicationError } from '../../../../../modules/search/application/errors/search-application.error';

const VALIDATION_ERROR_CODES = new Set([
  'INVALID_SEARCH_QUERY',
  'INVALID_SEARCH_MIN_PRICE',
  'INVALID_SEARCH_MAX_PRICE',
  'INVALID_SEARCH_PRICE_RANGE',
  'INVALID_SEARCH_STATUS',
  'INVALID_SEARCH_SORT',
  'INVALID_SEARCH_PAGE',
  'INVALID_SEARCH_PAGE_SIZE',
]);

export function mapSearchResult<T>(result: Result<T, SearchApplicationError>): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  if (error.code === 'SEARCH_UNAVAILABLE') {
    throw new ServiceUnavailableException(error.message);
  }

  if (VALIDATION_ERROR_CODES.has(error.code)) {
    throw new BadRequestException(error.message);
  }

  throw new UnprocessableEntityException(error.message);
}
