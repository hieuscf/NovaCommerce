import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { V1Module } from './api/v1/v1.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthService } from './auth/jwt-auth.service';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HealthController } from './health.controller';
import { ReadyController } from './ready.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    V1Module,
  ],
  controllers: [HealthController, ReadyController],
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
