import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import type { ProductResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductToDto } from '../mappers/map-product-to-dto';

export interface GetProductByIdQuery {
  readonly productId: string;
}

export class GetProductByIdHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    query: GetProductByIdQuery,
  ): Promise<Result<ProductResponseDto, CatalogApplicationError>> {
    const product = await this.productRepository.findById(query.productId);
    if (!product) {
      return Result.fail(new CatalogApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    return Result.ok(mapProductToDto(product));
  }
}
