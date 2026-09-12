import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { Product } from '../../domain/aggregates/product';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import { Money } from '../../domain/value-objects/money';
import { ProductName } from '../../domain/value-objects/product-name';
import { ProductSlug } from '../../domain/value-objects/product-slug';
import type { ProductResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductToDto } from '../mappers/map-product-to-dto';

export interface CreateProductCommand {
  readonly name: string;
  readonly slug: string;
  readonly basePriceAmount: number;
  readonly basePriceCurrency: string;
  readonly categoryId?: string;
}

export class CreateProductHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    command: CreateProductCommand,
  ): Promise<Result<ProductResponseDto, CatalogApplicationError>> {
    try {
      const name = ProductName.create(command.name);
      const slug = ProductSlug.create(command.slug);
      const basePrice = Money.create(command.basePriceAmount, command.basePriceCurrency);

      const slugExists = await this.productRepository.existsBySlug(slug);
      if (slugExists) {
        return Result.fail(new CatalogApplicationError('Product slug already exists', 'DUPLICATE_SLUG'));
      }

      const createResult = Product.create(randomUUID(), name, slug, basePrice, command.categoryId);
      if (createResult.isFailure) {
        return Result.fail(
          new CatalogApplicationError(createResult.getError().message, createResult.getError().code),
        );
      }

      const product = createResult.getValue();
      await this.productRepository.save(product);

      return Result.ok(mapProductToDto(product));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create product';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'CREATE_PRODUCT_FAILED';
      return Result.fail(new CatalogApplicationError(message, code));
    }
  }
}
