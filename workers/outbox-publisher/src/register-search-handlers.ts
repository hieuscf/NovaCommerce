import { ConfigurationError, type IEventBus } from '@novacommerce/building-blocks';
import { OpenSearchClientService } from '@novacommerce/infrastructure';
import { ProductCreatedHandler } from '../../../modules/search/application/handlers/product-created.handler';
import { ProductUpdatedHandler } from '../../../modules/search/application/handlers/product-updated.handler';
import { registerSearchEventHandlers } from '../../../modules/search/application/register-search-event-handlers';
import { ProductIndexer } from '../../../modules/search/application/services/product-indexer';
import { ConsoleLogger } from '../../../modules/search/infrastructure/logging/console-logger';
import { OpenSearchProductSearchIndex } from '../../../modules/search/infrastructure/opensearch/opensearch-product-search-index';
import { resolveProductSearchIndexName } from '../../../modules/search/infrastructure/opensearch/product-search-index-name';

/**
 * Wires Search product indexing handlers onto the worker event bus.
 * Catalog events arrive via Outbox → EventBus; Search does not query PostgreSQL.
 */
export function registerSearchWorker(eventBus: IEventBus): void {
  const openSearchUrl = process.env.OPENSEARCH_URL?.trim();
  if (!openSearchUrl) {
    throw new ConfigurationError('Missing environment variable: OPENSEARCH_URL');
  }

  const logger = new ConsoleLogger({ module: 'search' });
  const indexName = resolveProductSearchIndexName(process.env.OPENSEARCH_PRODUCT_INDEX);
  const searchClient = new OpenSearchClientService({
    url: openSearchUrl,
    username: process.env.OPENSEARCH_USERNAME?.trim() || undefined,
    password: process.env.OPENSEARCH_PASSWORD?.trim() || undefined,
  });
  const productSearchIndex = new OpenSearchProductSearchIndex(searchClient, logger, indexName);
  const productIndexer = new ProductIndexer(productSearchIndex, logger, indexName);

  registerSearchEventHandlers(
    eventBus,
    new ProductCreatedHandler(productIndexer, logger),
    new ProductUpdatedHandler(productIndexer, logger),
  );
}
