import type { PrismaClient } from '@prisma/client';
import { Category } from '../../domain/aggregates/category';
import type { ICategoryRepository } from '../../domain/repositories/i-category-repository';

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { slug } });
    return row ? this.toDomain(row) : null;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const row = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!row) {
      return false;
    }
    return excludeId ? row.id !== excludeId : true;
  }

  async list(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async save(category: Category): Promise<void> {
    await this.prisma.category.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        name: category.getName(),
        slug: category.getSlug(),
        parentId: category.getParentId(),
      },
      update: {
        name: category.getName(),
        slug: category.getSlug(),
        parentId: category.getParentId(),
      },
    });
  }

  private toDomain(row: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return Category.reconstitute({
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parentId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
