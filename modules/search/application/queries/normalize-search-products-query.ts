import { Result } from '@novacommerce/building-blocks';
import {
  PRODUCT_SEARCH_STATUSES,
  type ProductSearchStatus,
} from '../../domain/entities/product-search-document';
import {
  isProductSearchSort,
  type ProductSearchCriteria,
  type ProductSearchSort,
} from '../../domain/queries/product-search-criteria';
import {
  DEFAULT_PRODUCT_SEARCH_PAGE,
  DEFAULT_PRODUCT_SEARCH_PAGE_SIZE,
  MAX_PRODUCT_SEARCH_PAGE_SIZE,
  MAX_PRODUCT_SEARCH_QUERY_LENGTH,
  MAX_PRODUCT_SEARCH_RESULT_WINDOW,
} from '../constants';
import { SearchApplicationError } from '../errors/search-application.error';
import type { SearchProductsQuery } from './search-products.query';

export function normalizeSearchProductsQuery(
  input: SearchProductsQuery,
): Result<ProductSearchCriteria, SearchApplicationError> {
  const query = normalizeOptionalText(input.query);
  if (query && query.length > MAX_PRODUCT_SEARCH_QUERY_LENGTH) {
    return Result.fail(
      new SearchApplicationError(
        `Query must be at most ${MAX_PRODUCT_SEARCH_QUERY_LENGTH} characters`,
        'INVALID_SEARCH_QUERY',
      ),
    );
  }

  const categoryId = normalizeOptionalText(input.categoryId);
  const brandId = normalizeOptionalText(input.brandId);

  const minPriceResult = normalizeOptionalPrice(input.minPrice, 'minPrice', 'INVALID_SEARCH_MIN_PRICE');
  if (minPriceResult.isFailure) {
    return Result.fail(minPriceResult.getError());
  }

  const maxPriceResult = normalizeOptionalPrice(input.maxPrice, 'maxPrice', 'INVALID_SEARCH_MAX_PRICE');
  if (maxPriceResult.isFailure) {
    return Result.fail(maxPriceResult.getError());
  }

  const minPrice = minPriceResult.getValue();
  const maxPrice = maxPriceResult.getValue();
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    return Result.fail(
      new SearchApplicationError('minPrice must be less than or equal to maxPrice', 'INVALID_SEARCH_PRICE_RANGE'),
    );
  }

  const statusResult = normalizeOptionalStatus(input.status);
  if (statusResult.isFailure) {
    return Result.fail(statusResult.getError());
  }

  const sortResult = normalizeSort(input.sort, Boolean(query));
  if (sortResult.isFailure) {
    return Result.fail(sortResult.getError());
  }

  const pageResult = normalizePage(input.page);
  if (pageResult.isFailure) {
    return Result.fail(pageResult.getError());
  }

  const pageSizeResult = normalizePageSize(input.pageSize);
  if (pageSizeResult.isFailure) {
    return Result.fail(pageSizeResult.getError());
  }

  const page = pageResult.getValue();
  const pageSize = pageSizeResult.getValue();
  if ((page - 1) * pageSize >= MAX_PRODUCT_SEARCH_RESULT_WINDOW) {
    return Result.fail(
      new SearchApplicationError('Requested page is beyond the maximum result window', 'INVALID_SEARCH_PAGE'),
    );
  }

  return Result.ok({
    query,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    status: statusResult.getValue(),
    sort: sortResult.getValue(),
    page,
    pageSize,
  });
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeOptionalPrice(
  value: number | undefined,
  field: string,
  code: string,
): Result<number | undefined, SearchApplicationError> {
  if (value === undefined) {
    return Result.ok(undefined);
  }

  if (!Number.isFinite(value) || value < 0) {
    return Result.fail(new SearchApplicationError(`${field} must be a non-negative finite number`, code));
  }

  return Result.ok(value);
}

function normalizeOptionalStatus(
  value: string | undefined,
): Result<ProductSearchStatus | undefined, SearchApplicationError> {
  if (value === undefined || value.trim() === '') {
    return Result.ok(undefined);
  }

  const status = value.trim();
  if (!(PRODUCT_SEARCH_STATUSES as readonly string[]).includes(status)) {
    return Result.fail(new SearchApplicationError('Unsupported search status filter', 'INVALID_SEARCH_STATUS'));
  }

  return Result.ok(status as ProductSearchStatus);
}

function normalizeSort(
  value: string | undefined,
  hasKeyword: boolean,
): Result<ProductSearchSort, SearchApplicationError> {
  if (value === undefined || value.trim() === '') {
    return Result.ok(hasKeyword ? 'relevance' : 'createdAt_desc');
  }

  const sort = value.trim();
  if (!isProductSearchSort(sort)) {
    return Result.fail(new SearchApplicationError('Unsupported search sort', 'INVALID_SEARCH_SORT'));
  }

  return Result.ok(sort);
}

function normalizePage(value: number | undefined): Result<number, SearchApplicationError> {
  if (value === undefined) {
    return Result.ok(DEFAULT_PRODUCT_SEARCH_PAGE);
  }

  if (!Number.isInteger(value) || value < 1) {
    return Result.fail(new SearchApplicationError('page must be an integer greater than or equal to 1', 'INVALID_SEARCH_PAGE'));
  }

  return Result.ok(value);
}

function normalizePageSize(value: number | undefined): Result<number, SearchApplicationError> {
  if (value === undefined) {
    return Result.ok(DEFAULT_PRODUCT_SEARCH_PAGE_SIZE);
  }

  if (!Number.isInteger(value) || value < 1 || value > MAX_PRODUCT_SEARCH_PAGE_SIZE) {
    return Result.fail(
      new SearchApplicationError(
        `pageSize must be an integer between 1 and ${MAX_PRODUCT_SEARCH_PAGE_SIZE}`,
        'INVALID_SEARCH_PAGE_SIZE',
      ),
    );
  }

  return Result.ok(value);
}
