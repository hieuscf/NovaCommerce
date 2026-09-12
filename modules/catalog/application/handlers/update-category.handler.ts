import { Result } from '@novacommerce/building-blocks';
import type { ICategoryRepository } from '../../domain/repositories/i-category-repository';
import type { CategoryResponseDto } from '../dto/category-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapCategoryToDto } from '../mappers/map-category-to-dto';

export interface UpdateCategoryCommand {
  readonly categoryId: string;
  readonly name?: string;
  readonly slug?: string;
  readonly parentId?: string | null;
}

export class UpdateCategoryHandler {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    command: UpdateCategoryCommand,
  ): Promise<Result<CategoryResponseDto, CatalogApplicationError>> {
    try {
      const category = await this.categoryRepository.findById(command.categoryId);
      if (!category) {
        return Result.fail(new CatalogApplicationError('Category not found', 'CATEGORY_NOT_FOUND'));
      }

      if (command.slug !== undefined) {
        const slugExists = await this.categoryRepository.existsBySlug(command.slug, category.id);
        if (slugExists) {
          return Result.fail(new CatalogApplicationError('Category slug already exists', 'DUPLICATE_SLUG'));
        }
        const slugResult = category.updateSlug(command.slug);
        if (slugResult.isFailure) {
          return Result.fail(
            new CatalogApplicationError(slugResult.getError().message, slugResult.getError().code),
          );
        }
      }

      if (command.name !== undefined) {
        const renameResult = category.rename(command.name);
        if (renameResult.isFailure) {
          return Result.fail(
            new CatalogApplicationError(renameResult.getError().message, renameResult.getError().code),
          );
        }
      }

      if (command.parentId !== undefined) {
        if (command.parentId) {
          const parent = await this.categoryRepository.findById(command.parentId);
          if (!parent) {
            return Result.fail(new CatalogApplicationError('Parent category not found', 'CATEGORY_NOT_FOUND'));
          }
        }
        const parentResult = category.changeParent(command.parentId ?? undefined);
        if (parentResult.isFailure) {
          return Result.fail(
            new CatalogApplicationError(parentResult.getError().message, parentResult.getError().code),
          );
        }
      }

      await this.categoryRepository.save(category);
      return Result.ok(mapCategoryToDto(category));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'UPDATE_CATEGORY_FAILED';
      return Result.fail(new CatalogApplicationError(message, code));
    }
  }
}
