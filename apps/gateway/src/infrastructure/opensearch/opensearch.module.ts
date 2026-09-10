import { Global, Module } from '@nestjs/common';
import type { ISearchClient } from '@novacommerce/building-blocks';
import { OpenSearchClientService } from '@novacommerce/infrastructure';
import type { AppConfig } from '@novacommerce/infrastructure';
import { APP_CONFIG } from '../../config/app-config.constants';
import { OpenSearchLifecycleService } from './opensearch-lifecycle.service';

export const SEARCH_CLIENT = Symbol('SEARCH_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: OpenSearchClientService,
      useFactory: (config: AppConfig) =>
        new OpenSearchClientService({
          url: config.opensearch.url,
          username: config.opensearch.username,
          password: config.opensearch.password,
        }),
      inject: [APP_CONFIG],
    },
    OpenSearchLifecycleService,
    {
      provide: SEARCH_CLIENT,
      useExisting: OpenSearchClientService,
    },
    {
      provide: 'ISearchClient',
      useExisting: OpenSearchClientService,
    },
  ],
  exports: [OpenSearchClientService, SEARCH_CLIENT, 'ISearchClient'],
})
export class OpenSearchModule {}

export type { ISearchClient };
