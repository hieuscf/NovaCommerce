import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'development-secret-change-me'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_TTL', '15m'),
        },
      }),
    }),
  ],
  providers: [
    {
      provide: JwtAuthService,
      useFactory: (jwtService: JwtService) => new JwtAuthService(jwtService),
      inject: [JwtService],
    },
  ],
  exports: [JwtAuthService, JwtModule],
})
export class AuthModule {}
