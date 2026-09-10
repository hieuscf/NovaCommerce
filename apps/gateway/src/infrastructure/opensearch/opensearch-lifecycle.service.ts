import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { OpenSearchClientService } from '@novacommerce/infrastructure';

@Injectable()
export class OpenSearchLifecycleService implements OnModuleDestroy {
  constructor(private readonly openSearchClientService: OpenSearchClientService) {}

  async onModuleDestroy(): Promise<void> {
    await this.openSearchClientService.close();
  }
}
