import type { BusEvent, ILogger } from '@novacommerce/building-blocks';
import { parseProductCreatedSearchContract } from '../contracts/product-search-event.contract';
import { SearchApplicationError } from '../errors/search-application.error';
import type { ProductIndexer } from '../services/product-indexer';

export class ProductCreatedHandler {
  constructor(
    private readonly productIndexer: ProductIndexer,
    private readonly logger: ILogger,
  ) {}

  async handle(event: BusEvent): Promise<void> {
    const contract = parseProductCreatedSearchContract(event);
    if (!contract) {
      throw new SearchApplicationError(
        'Invalid ProductCreated payload for search indexing',
        'INVALID_PRODUCT_CREATED',
      );
    }

    this.logger.info('ProductCreated event received', {
      module: 'search',
      handler: 'ProductCreatedHandler',
      eventId: contract.eventId,
      productId: contract.productId,
      operation: 'index',
    });

    await this.productIndexer.indexProduct(contract);
  }
}
