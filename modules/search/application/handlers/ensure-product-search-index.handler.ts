import { InfrastructureError, Result } from '@novacommerce/building-blocks';
import type { IProductSearchIndex } from '../../domain/repositories/i-product-search-index';
import { SearchApplicationError } from '../errors/search-application.error';

export class EnsureProductSearchIndexHandler {
  constructor(private readonly productSearchIndex: IProductSearchIndex) {}

  async execute(): Promise<Result<void, SearchApplicationError>> {
    try {
      await this.productSearchIndex.ensureIndex();
      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to ensure product search index';
      const code = error instanceof InfrastructureError ? error.code : 'ENSURE_PRODUCT_SEARCH_INDEX_FAILED';
      return Result.fail(new SearchApplicationError(message, code));
    }
  }
}
