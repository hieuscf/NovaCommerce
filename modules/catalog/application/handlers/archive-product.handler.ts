import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import type { ProductResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductToDto } from '../mappers/map-product-to-dto';

export interface ArchiveProductCommand {
  readonly productId: string;
}

export class ArchiveProductHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    command: ArchiveProductCommand,
  ): Promise<Result<ProductResponseDto, CatalogApplicationError>> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      return Result.fail(new CatalogApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    const archiveResult = product.archive();
    if (archiveResult.isFailure) {
      return Result.fail(
        new CatalogApplicationError(archiveResult.getError().message, archiveResult.getError().code),
      );
    }

    await this.productRepository.save(product);
    return Result.ok(mapProductToDto(product));
  }
}
