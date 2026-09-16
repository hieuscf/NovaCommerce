import { createHash } from 'node:crypto';
import type { ProductSearchCriteria } from '../../domain/queries/product-search-criteria';

export function buildProductSearchCacheKey(criteria: ProductSearchCriteria): string {
  const canonical = JSON.stringify({
    brandId: criteria.brandId ?? '',
    categoryId: criteria.categoryId ?? '',
    maxPrice: criteria.maxPrice ?? null,
    minPrice: criteria.minPrice ?? null,
    page: criteria.page,
    pageSize: criteria.pageSize,
    q: criteria.query?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '',
    sort: criteria.sort,
    status: criteria.status ?? '',
  });

  const hash = createHash('sha256').update(canonical).digest('hex');
  return `search:products:${hash}`;
}
