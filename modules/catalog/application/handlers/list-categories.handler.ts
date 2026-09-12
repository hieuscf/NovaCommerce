import { Result } from '@novacommerce/building-blocks';
import type { ICategoryRepository } from '../../domain/repositories/i-category-repository';
import type { CategoryResponseDto } from '../dto/category-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapCategoryToDto } from '../mappers/map-category-to-dto';

export class ListCategoriesHandler {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<Result<CategoryResponseDto[], CatalogApplicationError>> {
    const categories = await this.categoryRepository.list();
    return Result.ok(categories.map(mapCategoryToDto));
  }
}
