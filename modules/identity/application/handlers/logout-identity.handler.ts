import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IRefreshTokenStore } from '../ports/i-refresh-token-store';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IRefreshSessionRepository } from '../../domain/repositories/i-refresh-session-repository';
import { IdentityId } from '../../domain/value-objects/identity-id';

export interface LogoutIdentityCommand {
  readonly identityId: string;
  readonly refreshToken?: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class LogoutIdentityHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly refreshSessionRepository: IRefreshSessionRepository,
    private readonly refreshTokenStore: IRefreshTokenStore,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: LogoutIdentityCommand): Promise<Result<void, IdentityApplicationError>> {
    const identity = await this.identityRepository.findById(IdentityId.create(command.identityId));
    if (!identity) {
      return Result.fail(new IdentityApplicationError('Identity not found', 'IDENTITY_NOT_FOUND'));
    }

    if (command.refreshToken) {
      const tokenHash = this.refreshTokenStore.hash(command.refreshToken);
      const session = await this.refreshSessionRepository.findByTokenHash(tokenHash);
      if (session) {
        identity.revokeRefreshSession(session.id);
        await this.identityRepository.save(identity);
      }
    } else {
      await this.refreshSessionRepository.revokeAllForIdentity(identity.id);
    }

    await this.auditLogger.log({
      actorId: identity.id,
      action: 'LOGOUT',
      resource: 'identity',
      resourceId: identity.id,
      requestId: command.requestContext?.requestId,
      correlationId: command.requestContext?.correlationId,
      ipAddress: command.requestContext?.ipAddress,
      userAgent: command.requestContext?.userAgent,
    });

    return Result.ok(undefined);
  }
}
