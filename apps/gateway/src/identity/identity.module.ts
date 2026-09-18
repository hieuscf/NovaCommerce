import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheService } from '@novacommerce/infrastructure';
import { IDENTITY_TOKENS } from '../../../../modules/identity/contracts/tokens';
import { AssignPermissionToRoleHandler } from '../../../../modules/identity/application/handlers/assign-permission-to-role.handler';
import { AssignRoleHandler } from '../../../../modules/identity/application/handlers/assign-role.handler';
import { ChangePasswordHandler } from '../../../../modules/identity/application/handlers/change-password.handler';
import { CreateRoleHandler } from '../../../../modules/identity/application/handlers/create-role.handler';
import { DeleteRoleHandler } from '../../../../modules/identity/application/handlers/delete-role.handler';
import { DuplicateRoleHandler } from '../../../../modules/identity/application/handlers/duplicate-role.handler';
import { ListIdentitiesHandler } from '../../../../modules/identity/application/handlers/list-identities.handler';
import { UpdateIdentityLockHandler } from '../../../../modules/identity/application/handlers/update-identity-lock.handler';
import { ListRoleMembersHandler } from '../../../../modules/identity/application/handlers/list-role-members.handler';
import { ListRolesHandler } from '../../../../modules/identity/application/handlers/list-roles.handler';
import { LoginIdentityHandler } from '../../../../modules/identity/application/handlers/login-identity.handler';
import { LogoutIdentityHandler } from '../../../../modules/identity/application/handlers/logout-identity.handler';
import { OAuthLoginHandler } from '../../../../modules/identity/application/handlers/oauth-login.handler';
import { RefreshTokenHandler } from '../../../../modules/identity/application/handlers/refresh-token.handler';
import { RegisterIdentityHandler } from '../../../../modules/identity/application/handlers/register-identity.handler';
import { RequestPasswordResetHandler } from '../../../../modules/identity/application/handlers/request-password-reset.handler';
import { ResetPasswordHandler } from '../../../../modules/identity/application/handlers/reset-password.handler';
import { RevokePermissionFromRoleHandler } from '../../../../modules/identity/application/handlers/revoke-permission-from-role.handler';
import { RevokeRoleHandler } from '../../../../modules/identity/application/handlers/revoke-role.handler';
import { UpdateRoleHandler } from '../../../../modules/identity/application/handlers/update-role.handler';
import { UpdateRolePermissionsHandler } from '../../../../modules/identity/application/handlers/update-role-permissions.handler';
import { AuthenticationTokenService } from '../../../../modules/identity/application/services/authentication-token.service';
import { RedisOAuthStateStore } from '../../../../modules/identity/infrastructure/oauth/redis-oauth-state-store';
import { StubOAuthProvider } from '../../../../modules/identity/infrastructure/oauth/stub-oauth-provider';
import { PrismaOutboxStore } from '../../../../modules/identity/infrastructure/prisma/prisma-outbox-store';
import { PrismaIdentityRepository } from '../../../../modules/identity/infrastructure/repositories/prisma-identity-repository';
import { PrismaPasswordResetTokenRepository } from '../../../../modules/identity/infrastructure/repositories/prisma-password-reset-token-repository';
import { PrismaPermissionRepository } from '../../../../modules/identity/infrastructure/repositories/prisma-permission-repository';
import { PrismaRefreshSessionRepository } from '../../../../modules/identity/infrastructure/repositories/prisma-refresh-session-repository';
import { PrismaRoleRepository } from '../../../../modules/identity/infrastructure/repositories/prisma-role-repository';
import {
  BcryptPasswordHasher,
} from '../../../../modules/identity/infrastructure/services/bcrypt-password-hasher';
import { CryptoRefreshTokenStore } from '../../../../modules/identity/infrastructure/services/crypto-refresh-token-store';
import { JwtAccessTokenService } from '../../../../modules/identity/infrastructure/services/jwt-access-token-service';
import { PrismaAuditLogger } from '../../../../modules/identity/infrastructure/services/prisma-audit-logger';
import { PrismaAuthorizationService } from '../../../../modules/identity/infrastructure/services/prisma-authorization-service';
import { AuthController } from './controllers/auth.controller';
import { IdentitiesController } from './controllers/identities.controller';
import { RolesController } from './controllers/roles.controller';
import { PrismaService } from '../infrastructure/database/prisma.service';

function parseDurationToSeconds(value: string, fallback: number): number {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) {
    return fallback;
  }
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  switch (unit) {
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 3600;
    case 'd':
      return amount * 86400;
    default:
      return amount;
  }
}

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AuthController, RolesController, IdentitiesController],
  providers: [
    {
      provide: IDENTITY_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: IDENTITY_TOKENS.IDENTITY_REPOSITORY,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaIdentityRepository(prisma, outboxStore),
      inject: [PrismaService, IDENTITY_TOKENS.OUTBOX_STORE],
    },
    {
      provide: IDENTITY_TOKENS.ROLE_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaRoleRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: IDENTITY_TOKENS.PERMISSION_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaPermissionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: IDENTITY_TOKENS.REFRESH_SESSION_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaRefreshSessionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: IDENTITY_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaPasswordResetTokenRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: IDENTITY_TOKENS.PASSWORD_HASHER,
      useFactory: (configService: ConfigService) =>
        new BcryptPasswordHasher(Number(configService.get('PASSWORD_HASH_COST', '16384'))),
      inject: [ConfigService],
    },
    {
      provide: IDENTITY_TOKENS.REFRESH_TOKEN_STORE,
      useFactory: (configService: ConfigService) => {
        const ttlSeconds = parseDurationToSeconds(
          configService.get<string>('JWT_REFRESH_TOKEN_TTL', '7d'),
          604800,
        );
        return new CryptoRefreshTokenStore(ttlSeconds * 1000);
      },
      inject: [ConfigService],
    },
    {
      provide: IDENTITY_TOKENS.ACCESS_TOKEN_SERVICE,
      useFactory: (jwtService: JwtService, configService: ConfigService) =>
        new JwtAccessTokenService(
          { sign: (payload) => jwtService.sign(payload) },
          parseDurationToSeconds(configService.get<string>('JWT_ACCESS_TOKEN_TTL', '15m'), 900),
        ),
      inject: [JwtService, ConfigService],
    },
    {
      provide: IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
      useFactory: (prisma: PrismaService) => new PrismaAuthorizationService(prisma),
      inject: [PrismaService],
    },
    {
      provide: IDENTITY_TOKENS.AUDIT_LOGGER,
      useFactory: (prisma: PrismaService) => new PrismaAuditLogger(prisma),
      inject: [PrismaService],
    },
    {
      provide: IDENTITY_TOKENS.OAUTH_STATE_STORE,
      useFactory: (cache: RedisCacheService) => new RedisOAuthStateStore(cache),
      inject: [RedisCacheService],
    },
    {
      provide: IDENTITY_TOKENS.OAUTH_PROVIDERS,
      useFactory: (stateStore: RedisOAuthStateStore) => [
        new StubOAuthProvider('google', stateStore),
      ],
      inject: [IDENTITY_TOKENS.OAUTH_STATE_STORE],
    },
    {
      provide: AuthenticationTokenService,
      useFactory: (
        authorizationService: PrismaAuthorizationService,
        accessTokenService: JwtAccessTokenService,
        refreshTokenStore: CryptoRefreshTokenStore,
        identityRepository: PrismaIdentityRepository,
      ) =>
        new AuthenticationTokenService(
          authorizationService,
          accessTokenService,
          refreshTokenStore,
          identityRepository,
        ),
      inject: [
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.ACCESS_TOKEN_SERVICE,
        IDENTITY_TOKENS.REFRESH_TOKEN_STORE,
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
      ],
    },
    {
      provide: RegisterIdentityHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        passwordHasher: BcryptPasswordHasher,
        auditLogger: PrismaAuditLogger,
      ) => new RegisterIdentityHandler(identityRepository, passwordHasher, auditLogger),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.PASSWORD_HASHER,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: LoginIdentityHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        passwordHasher: BcryptPasswordHasher,
        authenticationTokenService: AuthenticationTokenService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new LoginIdentityHandler(
          identityRepository,
          passwordHasher,
          authenticationTokenService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.PASSWORD_HASHER,
        AuthenticationTokenService,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: LogoutIdentityHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        refreshSessionRepository: PrismaRefreshSessionRepository,
        refreshTokenStore: CryptoRefreshTokenStore,
        auditLogger: PrismaAuditLogger,
      ) =>
        new LogoutIdentityHandler(
          identityRepository,
          refreshSessionRepository,
          refreshTokenStore,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_SESSION_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_TOKEN_STORE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: RefreshTokenHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        refreshSessionRepository: PrismaRefreshSessionRepository,
        refreshTokenStore: CryptoRefreshTokenStore,
        authorizationService: PrismaAuthorizationService,
        accessTokenService: JwtAccessTokenService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new RefreshTokenHandler(
          identityRepository,
          refreshSessionRepository,
          refreshTokenStore,
          authorizationService,
          accessTokenService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_SESSION_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_TOKEN_STORE,
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.ACCESS_TOKEN_SERVICE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: ChangePasswordHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        refreshSessionRepository: PrismaRefreshSessionRepository,
        passwordHasher: BcryptPasswordHasher,
        auditLogger: PrismaAuditLogger,
      ) =>
        new ChangePasswordHandler(
          identityRepository,
          refreshSessionRepository,
          passwordHasher,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_SESSION_REPOSITORY,
        IDENTITY_TOKENS.PASSWORD_HASHER,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: RequestPasswordResetHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        passwordResetTokenRepository: PrismaPasswordResetTokenRepository,
        refreshTokenStore: CryptoRefreshTokenStore,
        auditLogger: PrismaAuditLogger,
        configService: ConfigService,
      ) => {
        const ttlSeconds = parseDurationToSeconds(
          configService.get<string>('PASSWORD_RESET_TOKEN_TTL', '1h'),
          3600,
        );
        return new RequestPasswordResetHandler(
          identityRepository,
          passwordResetTokenRepository,
          refreshTokenStore,
          auditLogger,
          ttlSeconds * 1000,
        );
      },
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_TOKEN_STORE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
        ConfigService,
      ],
    },
    {
      provide: ResetPasswordHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        passwordResetTokenRepository: PrismaPasswordResetTokenRepository,
        refreshSessionRepository: PrismaRefreshSessionRepository,
        refreshTokenStore: CryptoRefreshTokenStore,
        passwordHasher: BcryptPasswordHasher,
        auditLogger: PrismaAuditLogger,
      ) =>
        new ResetPasswordHandler(
          identityRepository,
          passwordResetTokenRepository,
          refreshSessionRepository,
          refreshTokenStore,
          passwordHasher,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_SESSION_REPOSITORY,
        IDENTITY_TOKENS.REFRESH_TOKEN_STORE,
        IDENTITY_TOKENS.PASSWORD_HASHER,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: ListRolesHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        identityRepository: PrismaIdentityRepository,
      ) => new ListRolesHandler(roleRepository, identityRepository),
      inject: [IDENTITY_TOKENS.ROLE_REPOSITORY, IDENTITY_TOKENS.IDENTITY_REPOSITORY],
    },
    {
      provide: ListIdentitiesHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        authorizationService: PrismaAuthorizationService,
      ) => new ListIdentitiesHandler(identityRepository, authorizationService),
      inject: [IDENTITY_TOKENS.IDENTITY_REPOSITORY, IDENTITY_TOKENS.AUTHORIZATION_SERVICE],
    },
    {
      provide: UpdateIdentityLockHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        authorizationService: PrismaAuthorizationService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new UpdateIdentityLockHandler(identityRepository, authorizationService, auditLogger),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: ListRoleMembersHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        identityRepository: PrismaIdentityRepository,
      ) => new ListRoleMembersHandler(roleRepository, identityRepository),
      inject: [IDENTITY_TOKENS.ROLE_REPOSITORY, IDENTITY_TOKENS.IDENTITY_REPOSITORY],
    },
    {
      provide: CreateRoleHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        authorizationService: PrismaAuthorizationService,
      ) => new CreateRoleHandler(roleRepository, authorizationService),
      inject: [IDENTITY_TOKENS.ROLE_REPOSITORY, IDENTITY_TOKENS.AUTHORIZATION_SERVICE],
    },
    {
      provide: UpdateRoleHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        authorizationService: PrismaAuthorizationService,
      ) => new UpdateRoleHandler(roleRepository, authorizationService),
      inject: [IDENTITY_TOKENS.ROLE_REPOSITORY, IDENTITY_TOKENS.AUTHORIZATION_SERVICE],
    },
    {
      provide: DeleteRoleHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        authorizationService: PrismaAuthorizationService,
      ) => new DeleteRoleHandler(roleRepository, authorizationService),
      inject: [IDENTITY_TOKENS.ROLE_REPOSITORY, IDENTITY_TOKENS.AUTHORIZATION_SERVICE],
    },
    {
      provide: DuplicateRoleHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        authorizationService: PrismaAuthorizationService,
      ) => new DuplicateRoleHandler(roleRepository, authorizationService),
      inject: [IDENTITY_TOKENS.ROLE_REPOSITORY, IDENTITY_TOKENS.AUTHORIZATION_SERVICE],
    },
    {
      provide: AssignRoleHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        roleRepository: PrismaRoleRepository,
        authorizationService: PrismaAuthorizationService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new AssignRoleHandler(
          identityRepository,
          roleRepository,
          authorizationService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.ROLE_REPOSITORY,
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: RevokeRoleHandler,
      useFactory: (
        identityRepository: PrismaIdentityRepository,
        roleRepository: PrismaRoleRepository,
        authorizationService: PrismaAuthorizationService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new RevokeRoleHandler(
          identityRepository,
          roleRepository,
          authorizationService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.ROLE_REPOSITORY,
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: AssignPermissionToRoleHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        permissionRepository: PrismaPermissionRepository,
        authorizationService: PrismaAuthorizationService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new AssignPermissionToRoleHandler(
          roleRepository,
          permissionRepository,
          authorizationService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.ROLE_REPOSITORY,
        IDENTITY_TOKENS.PERMISSION_REPOSITORY,
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: UpdateRolePermissionsHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        permissionRepository: PrismaPermissionRepository,
        identityRepository: PrismaIdentityRepository,
        authorizationService: PrismaAuthorizationService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new UpdateRolePermissionsHandler(
          roleRepository,
          permissionRepository,
          identityRepository,
          authorizationService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.ROLE_REPOSITORY,
        IDENTITY_TOKENS.PERMISSION_REPOSITORY,
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: RevokePermissionFromRoleHandler,
      useFactory: (
        roleRepository: PrismaRoleRepository,
        permissionRepository: PrismaPermissionRepository,
        authorizationService: PrismaAuthorizationService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new RevokePermissionFromRoleHandler(
          roleRepository,
          permissionRepository,
          authorizationService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.ROLE_REPOSITORY,
        IDENTITY_TOKENS.PERMISSION_REPOSITORY,
        IDENTITY_TOKENS.AUTHORIZATION_SERVICE,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
    {
      provide: OAuthLoginHandler,
      useFactory: (
        providers: StubOAuthProvider[],
        identityRepository: PrismaIdentityRepository,
        authenticationTokenService: AuthenticationTokenService,
        auditLogger: PrismaAuditLogger,
      ) =>
        new OAuthLoginHandler(
          providers,
          identityRepository,
          authenticationTokenService,
          auditLogger,
        ),
      inject: [
        IDENTITY_TOKENS.OAUTH_PROVIDERS,
        IDENTITY_TOKENS.IDENTITY_REPOSITORY,
        AuthenticationTokenService,
        IDENTITY_TOKENS.AUDIT_LOGGER,
      ],
    },
  ],
})
export class IdentityModule {}
