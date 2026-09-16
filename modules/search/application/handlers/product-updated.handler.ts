import type { BusEvent, ILogger } from '@novacommerce/building-blocks';
import { parseProductUpdatedSearchContract } from '../contracts/product-search-event.contract';
import { SearchApplicationError } from '../errors/search-application.error';
import type { ProductIndexer } from '../services/product-indexer';

export class ProductUpdatedHandler {
  constructor(
    private readonly productIndexer: ProductIndexer,
    private readonly logger: ILogger,
  ) {}

  async handle(event: BusEvent): Promise<void> {
    const contract = parseProductUpdatedSearchContract(event);
    if (!contract) {
      throw new SearchApplicationError(
        'Invalid ProductUpdated payload for search indexing',
        'INVALID_PRODUCT_UPDATED',
      );
    }

    this.logger.info('ProductUpdated event received', {
      module: 'search',
      handler: 'ProductUpdatedHandler',
      eventId: contract.eventId,
      productId: contract.productId,
      operation: 'update',
    });

    await this.productIndexer.updateProduct(contract);
  }
}
