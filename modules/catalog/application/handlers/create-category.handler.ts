import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { Category } from '../../domain/aggregates/category';
import type { ICategoryRepository } from '../../domain/repositories/i-category-repository';
import type { CategoryResponseDto } from '../dto/category-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapCategoryToDto } from '../mappers/map-category-to-dto';

export interface CreateCategoryCommand {
  readonly name: string;
  readonly slug: string;
  readonly parentId?: string;
}

export class CreateCategoryHandler {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    command: CreateCategoryCommand,
  ): Promise<Result<CategoryResponseDto, CatalogApplicationError>> {
    try {
      const slugExists = await this.categoryRepository.existsBySlug(command.slug);
      if (slugExists) {
        return Result.fail(new CatalogApplicationError('Category slug already exists', 'DUPLICATE_SLUG'));
      }

      if (command.parentId) {
        const parent = await this.categoryRepository.findById(command.parentId);
        if (!parent) {
          return Result.fail(new CatalogApplicationError('Parent category not found', 'CATEGORY_NOT_FOUND'));
        }
      }

      const createResult = Category.create(randomUUID(), command.name, command.slug, command.parentId);
      if (createResult.isFailure) {
        return Result.fail(
          new CatalogApplicationError(createResult.getError().message, createResult.getError().code),
        );
      }

      const category = createResult.getValue();
      await this.categoryRepository.save(category);

      return Result.ok(mapCategoryToDto(category));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create category';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CREATE_CATEGORY_FAILED';
      return Result.fail(new CatalogApplicationError(message, code));
    }
  }
}
