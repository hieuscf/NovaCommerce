import type { ILogger, ISearchClient } from '@novacommerce/building-blocks';
import { InfrastructureError } from '@novacommerce/building-blocks';
import type { ProductSearchDocument } from '../../domain/entities/product-search-document';
import type { ProductSearchCriteria, ProductSearchHits } from '../../domain/queries/product-search-criteria';
import type { IProductSearchIndex } from '../../domain/repositories/i-product-search-index';
import { buildProductSearchRequest } from './build-product-search-query';
import { mapProductSearchDocumentToSource } from './map-product-search-document';
import { mapProductSearchSourceToDocument } from './map-product-search-source';
import { PRODUCT_SEARCH_MAPPINGS } from './product-search-mapping';
import { PRODUCT_SEARCH_INDEX, resolveProductSearchIndexName } from './product-search-index-name';
import { PRODUCT_SEARCH_SETTINGS } from './product-search-settings';

export class OpenSearchProductSearchIndex implements IProductSearchIndex {
  private readonly indexName: string;

  constructor(
    private readonly searchClient: ISearchClient,
    private readonly logger: ILogger,
    indexName: string = PRODUCT_SEARCH_INDEX,
  ) {
    this.indexName = resolveProductSearchIndexName(indexName);
  }

  async ensureIndex(): Promise<void> {
    const context = {
      module: 'search',
      operation: 'create-index',
      index: this.indexName,
    };

    try {
      const exists = await this.searchClient.indexExists(this.indexName);
      if (exists) {
        this.logger.info('Product search index already exists', context);
        return;
      }

      await this.searchClient.createIndex(
        this.indexName,
        PRODUCT_SEARCH_MAPPINGS,
        PRODUCT_SEARCH_SETTINGS,
      );
      this.logger.info('Product search index created', context);
    } catch (error) {
      if (isIndexAlreadyExistsError(error)) {
        this.logger.info('Product search index already exists', context);
        return;
      }

      this.logger.error(
        'Failed to create product search index',
        context,
        error instanceof Error ? error : undefined,
      );
      throw toInfrastructureError(error, 'OpenSearch create index failed');
    }
  }

  async indexDocument(document: ProductSearchDocument): Promise<void> {
    try {
      await this.searchClient.indexDocument({
        index: this.indexName,
        id: document.id,
        document: mapProductSearchDocumentToSource(document),
      });
    } catch (error) {
      this.logger.error(
        'Failed to index product search document',
        { module: 'search', operation: 'index-document', index: this.indexName },
        error instanceof Error ? error : undefined,
      );
      throw toInfrastructureError(error, 'OpenSearch index document failed');
    }
  }

  async updateDocument(document: ProductSearchDocument): Promise<void> {
    try {
      await this.searchClient.updateDocument({
        index: this.indexName,
        id: document.id,
        document: mapProductSearchDocumentToSource(document),
      });
    } catch (error) {
      this.logger.error(
        'Failed to update product search document',
        { module: 'search', operation: 'update-document', index: this.indexName },
        error instanceof Error ? error : undefined,
      );
      throw toInfrastructureError(error, 'OpenSearch update document failed');
    }
  }

  async deleteDocument(productId: string): Promise<void> {
    try {
      await this.searchClient.deleteDocument({
        index: this.indexName,
        id: productId,
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        return;
      }

      this.logger.error(
        'Failed to delete product search document',
        { module: 'search', operation: 'delete-document', index: this.indexName },
        error instanceof Error ? error : undefined,
      );
      throw toInfrastructureError(error, 'OpenSearch delete document failed');
    }
  }

  async search(criteria: ProductSearchCriteria): Promise<ProductSearchHits> {
    const request = buildProductSearchRequest(criteria);

    try {
      const result = await this.searchClient.search({
        index: this.indexName,
        query: request.query,
        sort: request.sort,
        from: request.from,
        size: request.size,
      });

      const items: ProductSearchDocument[] = [];
      for (const hit of result.hits) {
        const mapped = mapProductSearchSourceToDocument(hit.source, hit.id);
        if (mapped.isFailure) {
          this.logger.warn('Skipped invalid product search hit', {
            module: 'search',
            operation: 'search',
            index: this.indexName,
            productId: hit.id,
            code: mapped.getError().code,
          });
          continue;
        }

        items.push(mapped.getValue());
      }

      return {
        items,
        total: result.total,
      };
    } catch (error) {
      this.logger.error(
        'Failed to search product index',
        { module: 'search', operation: 'search', index: this.indexName },
        error instanceof Error ? error : undefined,
      );
      throw toInfrastructureError(error, 'OpenSearch search failed');
    }
  }
}

function toInfrastructureError(error: unknown, message: string): InfrastructureError {
  if (error instanceof InfrastructureError) {
    return error;
  }

  return new InfrastructureError(message, 'SEARCH_ERROR', error);
}

function isIndexAlreadyExistsError(error: unknown): boolean {
  return readErrorType(error) === 'resource_already_exists_exception';
}

function isNotFoundError(error: unknown): boolean {
  if (readStatusCode(error) === 404) {
    return true;
  }

  return readErrorType(error) === 'not_found' || readErrorType(error) === 'document_missing_exception';
}

function readErrorType(error: unknown): string | undefined {
  const cause = error instanceof InfrastructureError ? error.cause : error;
  if (typeof cause !== 'object' || cause === null) {
    return undefined;
  }

  const record = cause as {
    body?: { error?: { type?: unknown } };
    meta?: { body?: { error?: { type?: unknown } } };
  };

  const type = record.body?.error?.type ?? record.meta?.body?.error?.type;
  return typeof type === 'string' ? type : undefined;
}

function readStatusCode(error: unknown): number | undefined {
  const cause = error instanceof InfrastructureError ? error.cause : error;
  if (typeof cause !== 'object' || cause === null) {
    return undefined;
  }

  const record = cause as { statusCode?: unknown; meta?: { statusCode?: unknown } };
  if (typeof record.statusCode === 'number') {
    return record.statusCode;
  }

  return typeof record.meta?.statusCode === 'number' ? record.meta.statusCode : undefined;
}
