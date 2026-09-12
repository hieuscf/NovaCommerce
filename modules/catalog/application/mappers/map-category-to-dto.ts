import type { Category } from '../../domain/aggregates/category';
import type { CategoryResponseDto } from '../dto/category-response.dto';

export function mapCategoryToDto(category: Category): CategoryResponseDto {
  return {
    id: category.id,
    name: category.getName(),
    slug: category.getSlug(),
    parentId: category.getParentId(),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}
