import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import { ProductName } from '../../domain/value-objects/product-name';
import { ProductSlug } from '../../domain/value-objects/product-slug';
import type { ProductResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductToDto } from '../mappers/map-product-to-dto';

export interface UpdateProductCommand {
  readonly productId: string;
  readonly name?: string;
  readonly slug?: string;
  readonly categoryId?: string | null;
}

export class UpdateProductHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    command: UpdateProductCommand,
  ): Promise<Result<ProductResponseDto, CatalogApplicationError>> {
    try {
      const product = await this.productRepository.findById(command.productId);
      if (!product) {
        return Result.fail(new CatalogApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
      }

      const slug = command.slug !== undefined ? ProductSlug.create(command.slug) : undefined;
      if (slug) {
        const slugExists = await this.productRepository.existsBySlug(slug, product.id);
        if (slugExists) {
          return Result.fail(new CatalogApplicationError('Product slug already exists', 'DUPLICATE_SLUG'));
        }
      }

      const updateResult = product.updateDetails({
        name: command.name !== undefined ? ProductName.create(command.name) : undefined,
        slug,
        categoryId: command.categoryId,
      });

      if (updateResult.isFailure) {
        return Result.fail(
          new CatalogApplicationError(updateResult.getError().message, updateResult.getError().code),
        );
      }

      await this.productRepository.save(product);
      return Result.ok(mapProductToDto(product));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'UPDATE_PRODUCT_FAILED';
      return Result.fail(new CatalogApplicationError(message, code));
    }
  }
}
