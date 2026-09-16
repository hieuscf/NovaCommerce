import type { ILogger } from '@novacommerce/building-blocks';
import type { IProductSearchIndex } from '../../domain/repositories/i-product-search-index';
import type { ProductSearchIndexContract } from '../contracts/product-search-event.contract';
import { SearchApplicationError } from '../errors/search-application.error';
import { mapProductSearchContractToDocument } from '../mappers/map-product-search-event';

export class ProductIndexer {
  constructor(
    private readonly productSearchIndex: IProductSearchIndex,
    private readonly logger: ILogger,
    private readonly indexName: string,
  ) {}

  async indexProduct(contract: ProductSearchIndexContract): Promise<void> {
    await this.writeDocument(contract, 'index');
  }

  async updateProduct(contract: ProductSearchIndexContract): Promise<void> {
    await this.writeDocument(contract, 'update');
  }

  private async writeDocument(
    contract: ProductSearchIndexContract,
    operation: 'index' | 'update',
  ): Promise<void> {
    const documentResult = mapProductSearchContractToDocument(contract);
    if (documentResult.isFailure) {
      const error = documentResult.getError();
      this.logger.error(
        'Failed to map product search document',
        this.context(contract, operation, error.code),
        error,
      );
      throw new SearchApplicationError(error.message, error.code);
    }

    const document = documentResult.getValue();
    this.logger.info('Product index started', this.context(contract, operation));

    try {
      if (operation === 'index') {
        await this.productSearchIndex.indexDocument(document);
      } else {
        await this.productSearchIndex.updateDocument(document);
      }

      this.logger.info('Product index succeeded', this.context(contract, operation));
    } catch (error) {
      this.logger.error(
        'Product index failed',
        this.context(contract, operation),
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  private context(
    contract: ProductSearchIndexContract,
    operation: 'index' | 'update',
    errorCode?: string,
  ) {
    return {
      module: 'search',
      productId: contract.productId,
      eventId: contract.eventId,
      index: this.indexName,
      operation,
      ...(errorCode ? { errorCode } : {}),
    };
  }
}
