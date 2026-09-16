import type { ProductSearchDocument } from '../entities/product-search-document';
import type { ProductSearchStatus } from '../entities/product-search-document';

export const PRODUCT_SEARCH_SORTS = [
  'relevance',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'createdAt_asc',
  'createdAt_desc',
] as const;

export type ProductSearchSort = (typeof PRODUCT_SEARCH_SORTS)[number];

export function isProductSearchSort(value: string): value is ProductSearchSort {
  return (PRODUCT_SEARCH_SORTS as readonly string[]).includes(value);
}

export interface ProductSearchCriteria {
  readonly query?: string;
  readonly categoryId?: string;
  readonly brandId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly status?: ProductSearchStatus;
  readonly sort: ProductSearchSort;
  readonly page: number;
  readonly pageSize: number;
}

export interface ProductSearchHits {
  readonly items: readonly ProductSearchDocument[];
  readonly total: number;
}
