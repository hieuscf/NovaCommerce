import type { SearchSortClause } from '@novacommerce/building-blocks';
import type { ProductSearchCriteria, ProductSearchSort } from '../../domain/queries/product-search-criteria';

export interface ProductSearchOpenSearchRequest {
  readonly query: Record<string, unknown>;
  readonly sort: readonly SearchSortClause[];
  readonly from: number;
  readonly size: number;
}

export function buildProductSearchRequest(criteria: ProductSearchCriteria): ProductSearchOpenSearchRequest {
  return {
    query: buildQuery(criteria),
    sort: buildSort(criteria.sort),
    from: (criteria.page - 1) * criteria.pageSize,
    size: criteria.pageSize,
  };
}

function buildQuery(criteria: ProductSearchCriteria): Record<string, unknown> {
  const filters = buildFilters(criteria);
  const keyword = criteria.query?.trim();

  if (!keyword) {
    if (filters.length === 0) {
      return { match_all: {} };
    }

    return { bool: { filter: filters } };
  }

  const must = {
    bool: {
      should: [
        {
          multi_match: {
            query: keyword,
            fields: ['name^3', 'description', 'brand.name', 'tags'],
          },
        },
        {
          nested: {
            path: 'categories',
            query: {
              match: {
                'categories.name': keyword,
              },
            },
          },
        },
      ],
      minimum_should_match: 1,
    },
  };

  return {
    bool: {
      must: [must],
      ...(filters.length > 0 ? { filter: filters } : {}),
    },
  };
}

function buildFilters(criteria: ProductSearchCriteria): Record<string, unknown>[] {
  const filters: Record<string, unknown>[] = [];

  if (criteria.status) {
    filters.push({ term: { status: criteria.status } });
  }

  if (criteria.brandId) {
    filters.push({ term: { 'brand.id': criteria.brandId } });
  }

  if (criteria.categoryId) {
    filters.push({
      nested: {
        path: 'categories',
        query: {
          term: { 'categories.id': criteria.categoryId },
        },
      },
    });
  }

  if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
    const range: Record<string, number> = {};
    if (criteria.minPrice !== undefined) {
      range.gte = criteria.minPrice;
    }
    if (criteria.maxPrice !== undefined) {
      range.lte = criteria.maxPrice;
    }
    filters.push({ range: { price: range } });
  }

  return filters;
}

function buildSort(sort: ProductSearchSort): SearchSortClause[] {
  const primary = primarySort(sort);
  return [...primary, { id: { order: 'asc' } }];
}

function primarySort(sort: ProductSearchSort): SearchSortClause[] {
  switch (sort) {
    case 'relevance':
      return [{ _score: { order: 'desc' } }];
    case 'price_asc':
      return [{ price: { order: 'asc' } }];
    case 'price_desc':
      return [{ price: { order: 'desc' } }];
    case 'name_asc':
      return [{ 'name.keyword': { order: 'asc' } }];
    case 'name_desc':
      return [{ 'name.keyword': { order: 'desc' } }];
    case 'createdAt_asc':
      return [{ createdAt: { order: 'asc' } }];
    case 'createdAt_desc':
      return [{ createdAt: { order: 'desc' } }];
  }
}
