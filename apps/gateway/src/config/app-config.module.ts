import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadAppConfig, type AppConfig } from '@novacommerce/infrastructure';
import { APP_CONFIG } from './app-config.constants';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, unknown>): AppConfig =>
        loadAppConfig({ ...process.env, ...env } as NodeJS.ProcessEnv),
    }),
  ],
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: (): AppConfig => loadAppConfig(),
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
