import { getApiClient } from '@/lib/api/client';
import type {
  CategoryDto,
  ICatalogClient,
  ListProductsQuery,
  ProductDto,
  ProductListDto,
} from './types';

function toQueryString(query: ListProductsQuery = {}): string {
  const params = new URLSearchParams();
  if (query.status) {
    params.set('status', query.status);
  }
  if (query.categoryId) {
    params.set('categoryId', query.categoryId);
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

function createGatewayCatalogClient(): ICatalogClient {
  return {
    listProducts(query: ListProductsQuery = {}): Promise<ProductListDto> {
      return getApiClient().get<ProductListDto>(`/products${toQueryString(query)}`);
    },

    getProductBySlug(slug: string): Promise<ProductDto> {
      return getApiClient().get<ProductDto>(`/products/slug/${encodeURIComponent(slug)}`);
    },

    getProductById(productId: string): Promise<ProductDto> {
      return getApiClient().get<ProductDto>(`/products/${encodeURIComponent(productId)}`);
    },

    listCategories(): Promise<readonly CategoryDto[]> {
      return getApiClient().get<readonly CategoryDto[]>('/categories');
    },

    getCategoryById(categoryId: string): Promise<CategoryDto> {
      return getApiClient().get<CategoryDto>(`/categories/${encodeURIComponent(categoryId)}`);
    },
  };
}

export function createCatalogClient(): ICatalogClient {
  return createGatewayCatalogClient();
}

export const catalogClient: ICatalogClient = createCatalogClient();
