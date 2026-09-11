import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IPasswordHasher } from '../ports/i-password-hasher';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IRefreshSessionRepository } from '../../domain/repositories/i-refresh-session-repository';
import { IdentityId } from '../../domain/value-objects/identity-id';
import { PlainPassword } from '../../domain/value-objects/plain-password';

export interface ChangePasswordCommand {
  readonly identityId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class ChangePasswordHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly refreshSessionRepository: IRefreshSessionRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<Result<void, IdentityApplicationError>> {
    try {
      const identity = await this.identityRepository.findById(IdentityId.create(command.identityId));
      if (!identity) {
        return Result.fail(new IdentityApplicationError('Identity not found', 'IDENTITY_NOT_FOUND'));
      }

      const credential = identity.getCredentials()[0];
      if (!credential) {
        return Result.fail(new IdentityApplicationError('Invalid credentials', 'INVALID_CREDENTIALS'));
      }

      const valid = await this.passwordHasher.verify(command.currentPassword, credential.getPasswordHash());
      if (!valid) {
        return Result.fail(new IdentityApplicationError('Invalid credentials', 'INVALID_CREDENTIALS'));
      }

      const newPassword = PlainPassword.create(command.newPassword);
      const passwordHash = await this.passwordHasher.hash(newPassword.value);
      credential.updatePasswordHash(passwordHash);
      identity.updateCredential(credential);
      identity.recordPasswordChange();
      identity.revokeAllRefreshSessions();
      await this.refreshSessionRepository.revokeAllForIdentity(identity.id);
      await this.identityRepository.save(identity);

      await this.auditLogger.log({
        actorId: identity.id,
        action: 'PASSWORD_CHANGED',
        resource: 'identity',
        resourceId: identity.id,
        requestId: command.requestContext?.requestId,
        correlationId: command.requestContext?.correlationId,
        ipAddress: command.requestContext?.ipAddress,
        userAgent: command.requestContext?.userAgent,
      });

      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      const code = error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'PASSWORD_CHANGE_FAILED';
      return Result.fail(new IdentityApplicationError(message, code));
    }
  }
}
