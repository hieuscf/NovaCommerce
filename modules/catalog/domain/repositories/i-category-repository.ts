import type { Category } from '../aggregates/category';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  save(category: Category): Promise<void>;
}
