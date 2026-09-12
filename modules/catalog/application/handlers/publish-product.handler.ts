import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import type { ProductResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductToDto } from '../mappers/map-product-to-dto';

export interface PublishProductCommand {
  readonly productId: string;
}

export class PublishProductHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    command: PublishProductCommand,
  ): Promise<Result<ProductResponseDto, CatalogApplicationError>> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      return Result.fail(new CatalogApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    const publishResult = product.publish();
    if (publishResult.isFailure) {
      return Result.fail(
        new CatalogApplicationError(publishResult.getError().message, publishResult.getError().code),
      );
    }

    await this.productRepository.save(product);
    return Result.ok(mapProductToDto(product));
  }
}
