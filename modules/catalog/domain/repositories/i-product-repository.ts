import type { Product } from '../aggregates/product';
import type { ProductSlug } from '../value-objects/product-slug';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: ProductSlug): Promise<Product | null>;
  save(product: Product): Promise<void>;
}
