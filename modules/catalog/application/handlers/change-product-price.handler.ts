import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import { Money } from '../../domain/value-objects/money';
import type { ProductResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductToDto } from '../mappers/map-product-to-dto';

export interface ChangeProductPriceCommand {
  readonly productId: string;
  readonly amount: number;
  readonly currency: string;
}

export class ChangeProductPriceHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    command: ChangeProductPriceCommand,
  ): Promise<Result<ProductResponseDto, CatalogApplicationError>> {
    try {
      const product = await this.productRepository.findById(command.productId);
      if (!product) {
        return Result.fail(new CatalogApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
      }

      const newPrice = Money.create(command.amount, command.currency);
      const changeResult = product.changePrice(newPrice);
      if (changeResult.isFailure) {
        return Result.fail(
          new CatalogApplicationError(changeResult.getError().message, changeResult.getError().code),
        );
      }

      await this.productRepository.save(product);
      return Result.ok(mapProductToDto(product));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change product price';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CHANGE_PRODUCT_PRICE_FAILED';
      return Result.fail(new CatalogApplicationError(message, code));
    }
  }
}
