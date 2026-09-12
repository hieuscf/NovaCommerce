import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import { ProductSlug } from '../../domain/value-objects/product-slug';
import type { ProductResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductToDto } from '../mappers/map-product-to-dto';

export interface GetProductBySlugQuery {
  readonly slug: string;
}

export class GetProductBySlugHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    query: GetProductBySlugQuery,
  ): Promise<Result<ProductResponseDto, CatalogApplicationError>> {
    try {
      const slug = ProductSlug.create(query.slug);
      const product = await this.productRepository.findBySlug(slug);
      if (!product) {
        return Result.fail(new CatalogApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
      }

      return Result.ok(mapProductToDto(product));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get product';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'GET_PRODUCT_FAILED';
      return Result.fail(new CatalogApplicationError(message, code));
    }
  }
}
