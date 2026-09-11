import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { AuthenticationResponseDto } from '../dto/auth-response.dto';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IAccessTokenService } from '../ports/i-access-token-service';
import type { IRefreshTokenStore } from '../ports/i-refresh-token-store';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IRefreshSessionRepository } from '../../domain/repositories/i-refresh-session-repository';
import { RefreshSession } from '../../domain/entities/refresh-session';
import { IdentityId } from '../../domain/value-objects/identity-id';

export interface RefreshTokenCommand {
  readonly refreshToken: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class RefreshTokenHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly refreshSessionRepository: IRefreshSessionRepository,
    private readonly refreshTokenStore: IRefreshTokenStore,
    private readonly authorizationService: IAuthorizationService,
    private readonly accessTokenService: IAccessTokenService,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<Result<AuthenticationResponseDto, IdentityApplicationError>> {
    const tokenHash = this.refreshTokenStore.hash(command.refreshToken);
    const session = await this.refreshSessionRepository.findByTokenHash(tokenHash);

    if (!session || !session.isValid()) {
      return Result.fail(
        new IdentityApplicationError('Invalid or expired refresh token', 'REFRESH_TOKEN_INVALID'),
      );
    }

    const identityId = await this.refreshSessionRepository.findIdentityIdBySessionId(session.id);
    if (!identityId) {
      return Result.fail(new IdentityApplicationError('Invalid refresh token', 'REFRESH_TOKEN_INVALID'));
    }

    const identity = await this.identityRepository.findById(IdentityId.create(identityId));
    if (!identity) {
      return Result.fail(new IdentityApplicationError('Identity not found', 'IDENTITY_NOT_FOUND'));
    }

    const refresh = this.refreshTokenStore.issue();
    const rotateResult = identity.rotateRefreshSession(
      session.id,
      RefreshSession.create(refresh.sessionId, refresh.tokenHash, refresh.expiresAt, {
        userAgent: command.requestContext?.userAgent,
        ipAddress: command.requestContext?.ipAddress,
      }),
    );

    if (rotateResult.isFailure) {
      return Result.fail(new IdentityApplicationError(rotateResult.getError().message, rotateResult.getError().code));
    }

    await this.identityRepository.save(identity);

    const roles = await this.authorizationService.getRolesForIdentity(identity.id);
    const permissions = await this.authorizationService.getPermissionsForIdentity(identity.id);
    const accessToken = this.accessTokenService.issue({
      userId: identity.id,
      roles,
      permissions,
    });

    await this.auditLogger.log({
      actorId: identity.id,
      action: 'REFRESH_TOKEN_ROTATED',
      resource: 'refresh_session',
      resourceId: session.id,
      requestId: command.requestContext?.requestId,
      correlationId: command.requestContext?.correlationId,
      ipAddress: command.requestContext?.ipAddress,
      userAgent: command.requestContext?.userAgent,
      metadata: { replacedBySessionId: refresh.sessionId },
    });

    return Result.ok({
      accessToken: accessToken.accessToken,
      tokenType: 'Bearer',
      expiresIn: accessToken.expiresIn,
      refreshToken: refresh.rawToken,
    });
  }
}
