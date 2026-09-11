import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { AuthenticationResponseDto } from '../dto/auth-response.dto';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IPasswordHasher } from '../ports/i-password-hasher';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import { EmailAddress } from '../../domain/value-objects/email-address';
import { AuthenticationTokenService } from '../services/authentication-token.service';

export interface LoginIdentityCommand {
  readonly email: string;
  readonly password: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class LoginIdentityHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly authenticationTokenService: AuthenticationTokenService,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: LoginIdentityCommand): Promise<Result<AuthenticationResponseDto, IdentityApplicationError>> {
    const auditBase = {
      resource: 'identity' as const,
      requestId: command.requestContext?.requestId,
      correlationId: command.requestContext?.correlationId,
      ipAddress: command.requestContext?.ipAddress,
      userAgent: command.requestContext?.userAgent,
    };

    try {
      const email = EmailAddress.create(command.email);
      const identity = await this.identityRepository.findByEmail(email);

      if (!identity) {
        await this.auditLogger.log({ ...auditBase, action: 'LOGIN_FAILURE', metadata: { reason: 'invalid_credentials' } });
        return Result.fail(new IdentityApplicationError('Invalid credentials', 'INVALID_CREDENTIALS'));
      }

      const credential = identity.getCredentials()[0];
      if (!credential) {
        await this.auditLogger.log({
          ...auditBase,
          actorId: identity.id,
          resourceId: identity.id,
          action: 'LOGIN_FAILURE',
          metadata: { reason: 'invalid_credentials' },
        });
        return Result.fail(new IdentityApplicationError('Invalid credentials', 'INVALID_CREDENTIALS'));
      }

      const validPassword = await this.passwordHasher.verify(command.password, credential.getPasswordHash());
      if (!validPassword) {
        await this.auditLogger.log({
          ...auditBase,
          actorId: identity.id,
          resourceId: identity.id,
          action: 'LOGIN_FAILURE',
          metadata: { reason: 'invalid_credentials' },
        });
        return Result.fail(new IdentityApplicationError('Invalid credentials', 'INVALID_CREDENTIALS'));
      }

      const authResult = identity.recordAuthentication('password');
      if (authResult.isFailure) {
        await this.auditLogger.log({
          ...auditBase,
          actorId: identity.id,
          resourceId: identity.id,
          action: 'LOGIN_FAILURE',
          metadata: { reason: authResult.getError().code },
        });
        return Result.fail(new IdentityApplicationError(authResult.getError().message, authResult.getError().code));
      }

      const tokens = await this.authenticationTokenService.issueTokens(identity, {
        userAgent: command.requestContext?.userAgent,
        ipAddress: command.requestContext?.ipAddress,
      });

      await this.auditLogger.log({
        ...auditBase,
        actorId: identity.id,
        resourceId: identity.id,
        action: 'LOGIN_SUCCESS',
      });

      return Result.ok(tokens);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return Result.fail(new IdentityApplicationError(message, 'LOGIN_FAILED'));
    }
  }
}
