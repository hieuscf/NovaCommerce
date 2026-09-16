import { getApiClient } from '@/lib/api/client';
import type { ISearchClient, SearchProductsQuery, ProductSearchListDto } from './types';

function toQueryString(query: SearchProductsQuery = {}): string {
  const params = new URLSearchParams();
  if (query.q) {
    params.set('q', query.q);
  }
  if (query.categoryId) {
    params.set('categoryId', query.categoryId);
  }
  if (query.brandId) {
    params.set('brandId', query.brandId);
  }
  if (query.minPrice !== undefined) {
    params.set('minPrice', String(query.minPrice));
  }
  if (query.maxPrice !== undefined) {
    params.set('maxPrice', String(query.maxPrice));
  }
  if (query.status) {
    params.set('status', query.status);
  }
  if (query.sort) {
    params.set('sort', query.sort);
  }
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function createGatewaySearchClient(): ISearchClient {
  return {
    searchProducts(query: SearchProductsQuery = {}): Promise<ProductSearchListDto> {
      return getApiClient().get<ProductSearchListDto>(`/search/products${toQueryString(query)}`);
    },
  };
}

export function createSearchClient(): ISearchClient {
  return createGatewaySearchClient();
}

export const searchClient: ISearchClient = createSearchClient();
