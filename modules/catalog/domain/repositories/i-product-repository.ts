import type { Product, ProductStatus } from '../aggregates/product';
import type { ProductSlug } from '../value-objects/product-slug';

export interface ProductListParams {
  readonly status?: ProductStatus;
  readonly categoryId?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ProductListResult {
  readonly items: Product[];
  readonly total: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: ProductSlug): Promise<Product | null>;
  existsBySlug(slug: ProductSlug, excludeId?: string): Promise<boolean>;
  list(params?: ProductListParams): Promise<ProductListResult>;
  save(product: Product): Promise<void>;
}
