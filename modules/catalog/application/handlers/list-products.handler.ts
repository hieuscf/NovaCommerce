import { Result } from '@novacommerce/building-blocks';
import type { ProductStatus } from '../../domain/aggregates/product';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import type { ProductListResponseDto } from '../dto/product-response.dto';
import { CatalogApplicationError } from '../errors/catalog-application.error';
import { mapProductListToDto } from '../mappers/map-product-to-dto';

export interface ListProductsQuery {
  readonly status?: ProductStatus;
  readonly categoryId?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export class ListProductsHandler {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    query: ListProductsQuery,
  ): Promise<Result<ProductListResponseDto, CatalogApplicationError>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;

    const result = await this.productRepository.list({
      status: query.status,
      categoryId: query.categoryId,
      page,
      pageSize,
    });

    return Result.ok(mapProductListToDto(result.items, result.total, page, pageSize));
  }
}
