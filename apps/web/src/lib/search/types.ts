/**
 * Gateway Search DTOs for public product search.
 * Field names match `modules/search/application/dto/product-search-result.dto.ts`.
 */

export type ProductSearchStatusDto = 'draft' | 'published' | 'archived';

export type ProductSearchSortDto =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'createdAt_asc'
  | 'createdAt_desc';

export interface ProductSearchBrandDto {
  readonly id: string;
  readonly name: string;
}

export interface ProductSearchCategoryDto {
  readonly id: string;
  readonly name: string;
}

export interface ProductSearchAttributeDto {
  readonly name: string;
  readonly value: string;
}

export interface ProductSearchItemDto {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly status: ProductSearchStatusDto;
  readonly brand?: ProductSearchBrandDto;
  readonly categories: readonly ProductSearchCategoryDto[];
  readonly price: number;
  readonly currency: string;
  readonly images: readonly string[];
  readonly attributes: readonly ProductSearchAttributeDto[];
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductSearchListDto {
  readonly items: readonly ProductSearchItemDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface SearchProductsQuery {
  readonly q?: string;
  readonly categoryId?: string;
  readonly brandId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly status?: ProductSearchStatusDto;
  readonly sort?: ProductSearchSortDto;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ISearchClient {
  searchProducts(query?: SearchProductsQuery): Promise<ProductSearchListDto>;
}
