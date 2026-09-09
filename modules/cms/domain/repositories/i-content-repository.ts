import type { Content } from '../aggregates/content';

export interface IContentRepository {
  findById(id: string): Promise<Content | null>;
  findBySlug(slug: string): Promise<Content | null>;
  save(content: Content): Promise<void>;
}
