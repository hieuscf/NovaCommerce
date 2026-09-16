/**
 * Gateway Catalog DTOs for public product/category reads.
 * Field names match `modules/catalog/application/dto/*-response.dto.ts`.
 */

export type ProductStatusDto = 'draft' | 'published' | 'archived';

export interface ProductVariantDto {
  readonly id: string;
  readonly sku: string;
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly attributes: Record<string, string>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductImageDto {
  readonly id: string;
  readonly url: string;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductAttributeDto {
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductOptionDto {
  readonly id: string;
  readonly name: string;
  readonly values: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly basePriceAmount: number;
  readonly basePriceCurrency: string;
  readonly status: string;
  readonly categoryId?: string;
  readonly variants: readonly ProductVariantDto[];
  readonly images: readonly ProductImageDto[];
  readonly attributes: readonly ProductAttributeDto[];
  readonly options: readonly ProductOptionDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductListDto {
  readonly items: readonly ProductDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface CategoryDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly parentId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ListProductsQuery {
  readonly status?: ProductStatusDto;
  readonly categoryId?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ICatalogClient {
  listProducts(query?: ListProductsQuery): Promise<ProductListDto>;
  getProductBySlug(slug: string): Promise<ProductDto>;
  getProductById(productId: string): Promise<ProductDto>;
  listCategories(): Promise<readonly CategoryDto[]>;
  getCategoryById(categoryId: string): Promise<CategoryDto>;
}
