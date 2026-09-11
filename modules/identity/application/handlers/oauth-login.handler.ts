import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { AuthenticationResponseDto } from '../dto/auth-response.dto';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IOAuthProvider } from '../ports/i-oauth-provider';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import { Identity } from '../../domain/aggregates/identity';
import { ExternalIdentity } from '../../domain/entities/external-identity';
import { EmailAddress } from '../../domain/value-objects/email-address';
import { IdentityId } from '../../domain/value-objects/identity-id';
import { Provider } from '../../domain/value-objects/provider';
import { AuthenticationTokenService } from '../services/authentication-token.service';

export interface OAuthCallbackCommand {
  readonly provider: string;
  readonly code: string;
  readonly state: string;
  readonly redirectUri: string;
  readonly codeVerifier?: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class OAuthLoginHandler {
  constructor(
    private readonly providers: IOAuthProvider[],
    private readonly identityRepository: IIdentityRepository,
    private readonly authenticationTokenService: AuthenticationTokenService,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: OAuthCallbackCommand): Promise<Result<AuthenticationResponseDto, IdentityApplicationError>> {
    const provider = this.providers.find((item) => item.providerName === command.provider);
    if (!provider) {
      return Result.fail(new IdentityApplicationError('OAuth provider not found', 'OAUTH_PROVIDER_NOT_FOUND'));
    }

    try {
      const profile = await provider.exchangeCode(
        command.code,
        command.redirectUri,
        command.state,
        command.codeVerifier,
      );

      let identity =
        (await this.findByExternalIdentity(provider.providerName, profile.providerAccountId)) ??
        (profile.email && profile.emailVerified
          ? await this.identityRepository.findByEmail(EmailAddress.create(profile.email))
          : null);

      if (!identity) {
        const email = profile.email && profile.emailVerified
          ? EmailAddress.create(profile.email)
          : EmailAddress.create(`${profile.providerAccountId}@${provider.providerName}.oauth.local`);

        const registerResult = Identity.register(IdentityId.create(randomUUID()), email);
        if (registerResult.isFailure) {
          return Result.fail(new IdentityApplicationError(registerResult.getError().message, registerResult.getError().code));
        }

        identity = registerResult.getValue();
        identity.activate();
      }

      identity.addExternalIdentity(
        ExternalIdentity.create(
          randomUUID(),
          Provider.create(provider.providerName, profile.providerAccountId),
          profile.providerAccountId,
        ),
      );

      const authResult = identity.recordAuthentication(`oauth:${provider.providerName}`);
      if (authResult.isFailure) {
        return Result.fail(new IdentityApplicationError(authResult.getError().message, authResult.getError().code));
      }

      const tokens = await this.authenticationTokenService.issueTokens(identity, {
        userAgent: command.requestContext?.userAgent,
        ipAddress: command.requestContext?.ipAddress,
      });

      await this.auditLogger.log({
        actorId: identity.id,
        action: 'OAUTH_LOGIN',
        resource: 'identity',
        resourceId: identity.id,
        requestId: command.requestContext?.requestId,
        correlationId: command.requestContext?.correlationId,
        ipAddress: command.requestContext?.ipAddress,
        userAgent: command.requestContext?.userAgent,
        metadata: { provider: provider.providerName },
      });

      return Result.ok(tokens);
    } catch {
      return Result.fail(new IdentityApplicationError('OAuth authentication failed', 'OAUTH_AUTHENTICATION_FAILED'));
    }
  }

  private async findByExternalIdentity(
    _providerName: string,
    _providerAccountId: string,
  ): Promise<import('../../domain/aggregates/identity').Identity | null> {
    return null;
  }
}
