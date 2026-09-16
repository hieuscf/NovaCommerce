import { Inject, Module, OnModuleInit } from '@nestjs/common';
import type { ICache, IEventBus, ILogger } from '@novacommerce/building-blocks';
import { OpenSearchClientService, type AppConfig } from '@novacommerce/infrastructure';
import { SEARCH_TOKENS } from '../../../../modules/search/contracts/tokens';
import { EnsureProductSearchIndexHandler } from '../../../../modules/search/application/handlers/ensure-product-search-index.handler';
import { ProductCreatedHandler } from '../../../../modules/search/application/handlers/product-created.handler';
import { ProductUpdatedHandler } from '../../../../modules/search/application/handlers/product-updated.handler';
import { SearchProductsHandler } from '../../../../modules/search/application/handlers/search-products.handler';
import { registerSearchEventHandlers } from '../../../../modules/search/application/register-search-event-handlers';
import { ProductIndexer } from '../../../../modules/search/application/services/product-indexer';
import type { IProductSearchIndex } from '../../../../modules/search/domain/repositories/i-product-search-index';
import { ConsoleLogger } from '../../../../modules/search/infrastructure/logging/console-logger';
import { OpenSearchProductSearchIndex } from '../../../../modules/search/infrastructure/opensearch/opensearch-product-search-index';
import { resolveProductSearchIndexName } from '../../../../modules/search/infrastructure/opensearch/product-search-index-name';
import { APP_CONFIG } from '../config/app-config.constants';
import { EVENT_BUS } from '../infrastructure/events/event-bus.module';
import { CACHE_SERVICE } from '../infrastructure/redis/redis.module';
import { SearchController } from './controllers/search.controller';

@Module({
  controllers: [SearchController],
  providers: [
    {
      provide: SEARCH_TOKENS.LOGGER,
      useFactory: () => new ConsoleLogger({ module: 'search' }),
    },
    {
      provide: SEARCH_TOKENS.PRODUCT_SEARCH_INDEX,
      useFactory: (searchClient: OpenSearchClientService, config: AppConfig, logger: ILogger) =>
        new OpenSearchProductSearchIndex(
          searchClient,
          logger,
          resolveProductSearchIndexName(config.opensearch.productIndex),
        ),
      inject: [OpenSearchClientService, APP_CONFIG, SEARCH_TOKENS.LOGGER],
    },
    {
      provide: ProductIndexer,
      useFactory: (productSearchIndex: IProductSearchIndex, logger: ILogger, config: AppConfig) =>
        new ProductIndexer(
          productSearchIndex,
          logger,
          resolveProductSearchIndexName(config.opensearch.productIndex),
        ),
      inject: [SEARCH_TOKENS.PRODUCT_SEARCH_INDEX, SEARCH_TOKENS.LOGGER, APP_CONFIG],
    },
    {
      provide: EnsureProductSearchIndexHandler,
      useFactory: (productSearchIndex: IProductSearchIndex) =>
        new EnsureProductSearchIndexHandler(productSearchIndex),
      inject: [SEARCH_TOKENS.PRODUCT_SEARCH_INDEX],
    },
    {
      provide: ProductCreatedHandler,
      useFactory: (productIndexer: ProductIndexer, logger: ILogger) =>
        new ProductCreatedHandler(productIndexer, logger),
      inject: [ProductIndexer, SEARCH_TOKENS.LOGGER],
    },
    {
      provide: ProductUpdatedHandler,
      useFactory: (productIndexer: ProductIndexer, logger: ILogger) =>
        new ProductUpdatedHandler(productIndexer, logger),
      inject: [ProductIndexer, SEARCH_TOKENS.LOGGER],
    },
    {
      provide: SearchProductsHandler,
      useFactory: (
        productSearchIndex: IProductSearchIndex,
        cache: ICache,
        logger: ILogger,
        config: AppConfig,
      ) =>
        new SearchProductsHandler(productSearchIndex, cache, logger, {
          enabled: config.search.cacheEnabled,
          ttlSeconds: config.search.cacheTtlSeconds,
        }),
      inject: [SEARCH_TOKENS.PRODUCT_SEARCH_INDEX, CACHE_SERVICE, SEARCH_TOKENS.LOGGER, APP_CONFIG],
    },
  ],
  exports: [SEARCH_TOKENS.PRODUCT_SEARCH_INDEX, EnsureProductSearchIndexHandler],
})
export class SearchModule implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(EnsureProductSearchIndexHandler)
    private readonly ensureProductSearchIndex: EnsureProductSearchIndexHandler,
    private readonly productCreatedHandler: ProductCreatedHandler,
    private readonly productUpdatedHandler: ProductUpdatedHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    registerSearchEventHandlers(
      this.eventBus,
      this.productCreatedHandler,
      this.productUpdatedHandler,
    );

    const result = await this.ensureProductSearchIndex.execute();
    if (result.isFailure) {
      throw result.getError();
    }
  }
}
