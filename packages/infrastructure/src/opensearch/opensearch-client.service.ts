import { Client } from '@opensearch-project/opensearch';
import {
  AvailabilityError,
  InfrastructureError,
  type ISearchClient,
  type SearchDeleteDocumentInput,
  type SearchHealthResult,
  type SearchHealthStatus,
  type SearchIndexDocumentInput,
  type SearchQueryInput,
  type SearchResult,
  type SearchUpdateDocumentInput,
} from '@novacommerce/building-blocks';

export interface OpenSearchClientOptions {
  readonly url: string;
  readonly username?: string;
  readonly password?: string;
}

interface OpenSearchHit {
  readonly _id?: string;
  readonly _score?: number;
  readonly _source?: Record<string, unknown>;
}

export class OpenSearchClientService implements ISearchClient {
  private readonly client: Client;

  constructor(options: OpenSearchClientOptions) {
    this.client = new Client({
      node: options.url,
      auth:
        options.username && options.password
          ? {
              username: options.username,
              password: options.password,
            }
          : undefined,
    });
  }

  async ping(): Promise<void> {
    try {
      const response = await this.client.cluster.health();

      if (response.body.status === 'red') {
        throw new AvailabilityError('OpenSearch cluster status is red');
      }
    } catch (error) {
      if (error instanceof AvailabilityError) {
        throw error;
      }

      throw new AvailabilityError('OpenSearch health check failed', error);
    }
  }

  async health(): Promise<SearchHealthResult> {
    try {
      const response = await this.client.cluster.health();
      const status = this.toHealthStatus(response.body.status);

      return {
        status,
        clusterName: typeof response.body.cluster_name === 'string'
          ? response.body.cluster_name
          : undefined,
      };
    } catch (error) {
      throw new AvailabilityError('OpenSearch health request failed', error);
    }
  }

  async indexExists(index: string): Promise<boolean> {
    try {
      const response = await this.client.indices.exists({ index });

      if (typeof response.body === 'boolean') {
        return response.body;
      }

      return response.statusCode === 200;
    } catch (error) {
      if (this.isNotFound(error)) {
        return false;
      }

      throw this.wrapOperationError('OpenSearch index exists check failed', error);
    }
  }

  async createIndex(
    index: string,
    mappings?: Record<string, unknown>,
    settings?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const body =
        mappings || settings
          ? {
              ...(settings ? { settings } : {}),
              ...(mappings ? { mappings } : {}),
            }
          : undefined;

      await this.client.indices.create({
        index,
        body,
      });
    } catch (error) {
      throw this.wrapOperationError('OpenSearch create index failed', error);
    }
  }

  async deleteIndex(index: string): Promise<void> {
    try {
      await this.client.indices.delete({ index });
    } catch (error) {
      throw this.wrapOperationError('OpenSearch delete index failed', error);
    }
  }

  async indexDocument(input: SearchIndexDocumentInput): Promise<void> {
    try {
      await this.client.index({
        index: input.index,
        id: input.id,
        body: input.document,
        refresh: false,
      });
    } catch (error) {
      throw this.wrapOperationError('OpenSearch index document failed', error);
    }
  }

  async updateDocument(input: SearchUpdateDocumentInput): Promise<void> {
    try {
      await this.client.update({
        index: input.index,
        id: input.id,
        body: {
          doc: input.document,
        },
        refresh: false,
      });
    } catch (error) {
      throw this.wrapOperationError('OpenSearch update document failed', error);
    }
  }

  async deleteDocument(input: SearchDeleteDocumentInput): Promise<void> {
    try {
      await this.client.delete({
        index: input.index,
        id: input.id,
        refresh: false,
      });
    } catch (error) {
      throw this.wrapOperationError('OpenSearch delete document failed', error);
    }
  }

  async search(input: SearchQueryInput): Promise<SearchResult> {
    try {
      const response = await this.client.search({
        index: input.index,
        from: input.from,
        size: input.size,
        body: {
          query: input.query,
          ...(input.sort && input.sort.length > 0 ? { sort: [...input.sort] } : {}),
        },
      });

      const hits = Array.isArray(response.body.hits?.hits)
        ? response.body.hits.hits.map((hit: OpenSearchHit) => ({
            id: hit._id ?? '',
            score: hit._score ?? 0,
            source: hit._source ?? {},
          }))
        : [];

      const total = typeof response.body.hits?.total === 'number'
        ? response.body.hits.total
        : typeof response.body.hits?.total?.value === 'number'
          ? response.body.hits.total.value
          : hits.length;

      return {
        total,
        hits,
      };
    } catch (error) {
      throw this.wrapOperationError('OpenSearch search failed', error);
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  private toHealthStatus(status: unknown): SearchHealthStatus {
    if (status === 'green' || status === 'yellow' || status === 'red') {
      return status;
    }

    return 'unknown';
  }

  private isNotFound(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (statusCode === 404) {
      return true;
    }

    const meta = (error as { meta?: { statusCode?: unknown } }).meta;
    return meta?.statusCode === 404;
  }

  private wrapOperationError(message: string, error: unknown): InfrastructureError {
    if (error instanceof InfrastructureError) {
      return error;
    }

    return new InfrastructureError(message, 'SEARCH_ERROR', error);
  }
}
