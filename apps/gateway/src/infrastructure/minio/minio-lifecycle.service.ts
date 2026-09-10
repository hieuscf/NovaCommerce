import { Injectable, OnModuleInit } from '@nestjs/common';
import { MinioStorageService } from '@novacommerce/infrastructure';

@Injectable()
export class MinioLifecycleService implements OnModuleInit {
  constructor(private readonly minioStorageService: MinioStorageService) {}

  async onModuleInit(): Promise<void> {
    await this.minioStorageService.initialize();
  }
}
