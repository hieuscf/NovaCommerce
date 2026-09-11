import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IPasswordHasher } from '../ports/i-password-hasher';
import type { IRefreshTokenStore } from '../ports/i-refresh-token-store';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IPasswordResetTokenRepository } from '../../domain/repositories/i-password-reset-token-repository';
import type { IRefreshSessionRepository } from '../../domain/repositories/i-refresh-session-repository';
import { IdentityId } from '../../domain/value-objects/identity-id';
import { PlainPassword } from '../../domain/value-objects/plain-password';

export interface ResetPasswordCommand {
  readonly token: string;
  readonly newPassword: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class ResetPasswordHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly refreshSessionRepository: IRefreshSessionRepository,
    private readonly refreshTokenStore: IRefreshTokenStore,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<Result<void, IdentityApplicationError>> {
    try {
      const tokenHash = this.refreshTokenStore.hash(command.token);
      const resetToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

      if (!resetToken || !resetToken.isValid()) {
        return Result.fail(new IdentityApplicationError('Invalid reset token', 'INVALID_RESET_TOKEN'));
      }

      const identityId = await this.passwordResetTokenRepository.findIdentityIdByTokenHash(tokenHash);
      if (!identityId) {
        return Result.fail(new IdentityApplicationError('Invalid reset token', 'INVALID_RESET_TOKEN'));
      }

      const identity = await this.identityRepository.findById(IdentityId.create(identityId));
      if (!identity) {
        return Result.fail(new IdentityApplicationError('Identity not found', 'IDENTITY_NOT_FOUND'));
      }

      const credential = identity.getCredentials()[0];
      if (!credential) {
        return Result.fail(new IdentityApplicationError('Credential not found', 'CREDENTIAL_NOT_FOUND'));
      }

      const newPassword = PlainPassword.create(command.newPassword);
      const passwordHash = await this.passwordHasher.hash(newPassword.value);
      credential.updatePasswordHash(passwordHash);
      identity.updateCredential(credential);
      resetToken.markUsed();
      identity.recordPasswordResetCompleted();
      identity.revokeAllRefreshSessions();

      await this.passwordResetTokenRepository.save(resetToken, identity.id);
      await this.refreshSessionRepository.revokeAllForIdentity(identity.id);
      await this.identityRepository.save(identity);

      await this.auditLogger.log({
        actorId: identity.id,
        action: 'PASSWORD_RESET_COMPLETED',
        resource: 'identity',
        resourceId: identity.id,
        requestId: command.requestContext?.requestId,
        correlationId: command.requestContext?.correlationId,
        ipAddress: command.requestContext?.ipAddress,
        userAgent: command.requestContext?.userAgent,
      });

      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      return Result.fail(new IdentityApplicationError(message, 'PASSWORD_RESET_FAILED'));
    }
  }

}
