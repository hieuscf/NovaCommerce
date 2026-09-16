import type { ICache, ILogger } from '@novacommerce/building-blocks';
import { Result } from '@novacommerce/building-blocks';
import type { IProductSearchIndex } from '../../domain/repositories/i-product-search-index';
import { buildProductSearchCacheKey } from '../cache/build-product-search-cache-key';
import type { SearchProductsResult } from '../dto/product-search-result.dto';
import { SearchApplicationError } from '../errors/search-application.error';
import { mapProductSearchHitsToResult } from '../mappers/map-product-search-result';
import { normalizeSearchProductsQuery } from '../queries/normalize-search-products-query';
import type { SearchProductsQuery } from '../queries/search-products.query';

export interface SearchProductsCacheOptions {
  readonly enabled: boolean;
  readonly ttlSeconds: number;
}

export class SearchProductsHandler {
  constructor(
    private readonly productSearchIndex: IProductSearchIndex,
    private readonly cache: ICache,
    private readonly logger: ILogger,
    private readonly cacheOptions: SearchProductsCacheOptions,
  ) {}

  async execute(
    query: SearchProductsQuery,
  ): Promise<Result<SearchProductsResult, SearchApplicationError>> {
    const criteriaResult = normalizeSearchProductsQuery(query);
    if (criteriaResult.isFailure) {
      return Result.fail(criteriaResult.getError());
    }

    const criteria = criteriaResult.getValue();
    const cacheKey = buildProductSearchCacheKey(criteria);

    const cached = await this.readCache(cacheKey);
    if (cached) {
      return Result.ok(cached);
    }

    try {
      const hits = await this.productSearchIndex.search(criteria);
      const result = mapProductSearchHitsToResult(hits.items, hits.total, criteria.page, criteria.pageSize);
      await this.writeCache(cacheKey, result);
      return Result.ok(result);
    } catch (error) {
      this.logger.error(
        'Product search failed',
        { module: 'search', operation: 'search-products' },
        error instanceof Error ? error : undefined,
      );
      return Result.fail(new SearchApplicationError('Search is temporarily unavailable', 'SEARCH_UNAVAILABLE'));
    }
  }

  private async readCache(key: string): Promise<SearchProductsResult | null> {
    if (!this.cacheOptions.enabled) {
      return null;
    }

    try {
      const cached = await this.cache.get<unknown>(key);
      if (!isSearchProductsResult(cached)) {
        return null;
      }

      return cached;
    } catch (error) {
      this.logger.warn('Search cache read failed', {
        module: 'search',
        operation: 'cache-get',
        error: error instanceof Error ? error.message : 'unknown',
      });
      return null;
    }
  }

  private async writeCache(key: string, value: SearchProductsResult): Promise<void> {
    if (!this.cacheOptions.enabled) {
      return;
    }

    try {
      await this.cache.set(key, value, this.cacheOptions.ttlSeconds);
    } catch (error) {
      this.logger.warn('Search cache write failed', {
        module: 'search',
        operation: 'cache-set',
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  }
}

function isSearchProductsResult(value: unknown): value is SearchProductsResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Partial<SearchProductsResult>;
  return (
    Array.isArray(record.items) &&
    typeof record.total === 'number' &&
    typeof record.page === 'number' &&
    typeof record.pageSize === 'number' &&
    typeof record.totalPages === 'number'
  );
}
