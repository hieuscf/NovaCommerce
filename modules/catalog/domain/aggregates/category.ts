import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { CatalogDomainError } from '../errors/catalog-domain.error';

export class Category extends AggregateRoot<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private name: string, private slug: string, private parentId?: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, name: string, slug: string, parentId?: string): Result<Category, CatalogDomainError> {
    if (!name?.trim() || !slug?.trim()) {
      return Result.fail(new CatalogDomainError('Category name and slug are required', 'INVALID_CATEGORY'));
    }
    return Result.ok(new Category(id, new Date(), new Date(), name.trim(), slug.trim(), parentId));
  }

  static reconstitute(props: { id: string; name: string; slug: string; parentId?: string; createdAt: Date; updatedAt: Date }): Category {
    return new Category(props.id, props.createdAt, props.updatedAt, props.name, props.slug, props.parentId);
  }

  rename(name: string): Result<void, CatalogDomainError> {
    if (!name?.trim()) return Result.fail(new CatalogDomainError('Category name is required', 'INVALID_CATEGORY_NAME'));
    this.name = name.trim();
    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  getName(): string { return this.name; }
  getSlug(): string { return this.slug; }
  getParentId(): string | undefined { return this.parentId; }
}
