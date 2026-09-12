import { Result } from '@novacommerce/building-blocks';
import type { ICategoryRepository } from '../../domain/repositories/i-category-repository';
import type { CategoryResponseDto } from '../dto/category-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapCategoryToDto } from '../mappers/map-category-to-dto';

export interface GetCategoryByIdQuery {
  readonly categoryId: string;
}

export class GetCategoryByIdHandler {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    query: GetCategoryByIdQuery,
  ): Promise<Result<CategoryResponseDto, CatalogApplicationError>> {
    const category = await this.categoryRepository.findById(query.categoryId);
    if (!category) {
      return Result.fail(new CatalogApplicationError('Category not found', 'CATEGORY_NOT_FOUND'));
    }

    return Result.ok(mapCategoryToDto(category));
  }
}
