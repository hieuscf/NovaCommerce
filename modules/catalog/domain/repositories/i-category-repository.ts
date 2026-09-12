import type { Category } from '../aggregates/category';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  list(): Promise<Category[]>;
  save(category: Category): Promise<void>;
}
