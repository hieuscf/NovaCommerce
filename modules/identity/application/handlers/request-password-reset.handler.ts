import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IRefreshTokenStore } from '../ports/i-refresh-token-store';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IPasswordResetTokenRepository } from '../../domain/repositories/i-password-reset-token-repository';
import { PasswordResetToken } from '../../domain/entities/password-reset-token';
import { EmailAddress } from '../../domain/value-objects/email-address';

export interface RequestPasswordResetCommand {
  readonly email: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface RequestPasswordResetResult {
  readonly message: string;
  readonly resetToken?: string;
}

export class RequestPasswordResetHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly refreshTokenStore: IRefreshTokenStore,
    private readonly auditLogger: IAuditLogger,
    private readonly resetTokenTtlMs: number,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<Result<RequestPasswordResetResult, IdentityApplicationError>> {
    const genericMessage =
      'If the account exists, reset instructions will be sent.';

    try {
      const email = EmailAddress.create(command.email);
      const identity = await this.identityRepository.findByEmail(email);

      if (!identity) {
        return Result.ok({ message: genericMessage });
      }

      const rawToken = randomUUID();
      const tokenHash = this.refreshTokenStore.hash(rawToken);
      const resetToken = PasswordResetToken.create(
        randomUUID(),
        tokenHash,
        new Date(Date.now() + this.resetTokenTtlMs),
      );

      identity.recordPasswordResetRequest();
      await this.passwordResetTokenRepository.invalidateAllForIdentity(identity.id);
      await this.passwordResetTokenRepository.save(resetToken, identity.id);
      await this.identityRepository.save(identity);

      await this.auditLogger.log({
        actorId: identity.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'identity',
        resourceId: identity.id,
        requestId: command.requestContext?.requestId,
        correlationId: command.requestContext?.correlationId,
        ipAddress: command.requestContext?.ipAddress,
        userAgent: command.requestContext?.userAgent,
      });

      return Result.ok({ message: genericMessage, resetToken: rawToken });
    } catch {
      return Result.ok({ message: genericMessage });
    }
  }
}
