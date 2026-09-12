import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { V1Module } from './api/v1/v1.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthService } from './auth/jwt-auth.service';
import { AppConfigModule } from './config/app-config.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { DatabaseModule } from './infrastructure/database/database.module';
import { EventBusModule } from './infrastructure/events/event-bus.module';
import { HealthProbeModule } from './infrastructure/health/health-probe.module';
import { MinioModule } from './infrastructure/minio/minio.module';
import { OpenSearchModule } from './infrastructure/opensearch/opensearch.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { HealthController } from './health.controller';
import { IdentityModule } from './identity/identity.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    EventBusModule,
    RedisModule,
    OpenSearchModule,
    MinioModule,
    HealthProbeModule,
    AuthModule,
    IdentityModule,
    UserModule,
    CatalogModule,
    InventoryModule,
    V1Module,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: JwtAuthGuard,
      useFactory: (jwtAuthService: JwtAuthService) => new JwtAuthGuard(jwtAuthService),
      inject: [JwtAuthService],
    },
    {
      provide: PermissionsGuard,
      useFactory: () => new PermissionsGuard(),
    },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: PermissionsGuard },
  ],
})
export class AppModule {}
