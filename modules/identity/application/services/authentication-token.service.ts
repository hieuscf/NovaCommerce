import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IAccessTokenService } from '../ports/i-access-token-service';
import type { IRefreshTokenStore } from '../ports/i-refresh-token-store';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import { RefreshSession } from '../../domain/entities/refresh-session';
import type { Identity } from '../../domain/aggregates/identity';
import type { AuthenticationResponseDto } from '../dto/auth-response.dto';

export class AuthenticationTokenService {
  constructor(
    private readonly authorizationService: IAuthorizationService,
    private readonly accessTokenService: IAccessTokenService,
    private readonly refreshTokenStore: IRefreshTokenStore,
    private readonly identityRepository: IIdentityRepository,
  ) {}

  async issueTokens(
    identity: Identity,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthenticationResponseDto> {
    const roles = await this.authorizationService.getRolesForIdentity(identity.id);
    const permissions = await this.authorizationService.getPermissionsForIdentity(identity.id);
    const accessToken = this.accessTokenService.issue({
      userId: identity.id,
      roles,
      permissions,
    });

    const refresh = this.refreshTokenStore.issue();
    identity.addRefreshSession(
      RefreshSession.create(refresh.sessionId, refresh.tokenHash, refresh.expiresAt, metadata),
    );
    await this.identityRepository.save(identity);

    return {
      accessToken: accessToken.accessToken,
      tokenType: 'Bearer',
      expiresIn: accessToken.expiresIn,
      refreshToken: refresh.rawToken,
    };
  }
}
