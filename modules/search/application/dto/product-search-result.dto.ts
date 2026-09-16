import type { ProductSearchStatus } from '../../domain/entities/product-search-document';

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
  readonly status: ProductSearchStatus;
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

export interface SearchProductsResult {
  readonly items: readonly ProductSearchItemDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
