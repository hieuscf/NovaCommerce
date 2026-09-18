import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import { IdentityDomainError } from '../../domain/errors/identity-domain.error';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import { IdentityId } from '../../domain/value-objects/identity-id';

export interface UpdateIdentityLockCommand {
  readonly identityId: string;
  readonly locked: boolean;
  readonly actorId: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
  };
}

export interface IdentityLockResultDto {
  readonly id: string;
  readonly status: string;
  readonly disabled: boolean;
}

export class UpdateIdentityLockHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(
    command: UpdateIdentityLockCommand,
  ): Promise<Result<IdentityLockResultDto, IdentityApplicationError>> {
    const canEdit = await this.authorizationService.can(command.actorId, 'identity:account:edit');
    if (!canEdit) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    if (command.actorId === command.identityId) {
      return Result.fail(
        new IdentityApplicationError(
          'You cannot lock or unlock your own account',
          'CANNOT_MODIFY_OWN_ACCOUNT',
        ),
      );
    }

    let identityId: IdentityId;
    try {
      identityId = IdentityId.create(command.identityId);
    } catch (error) {
      if (error instanceof IdentityDomainError) {
        return Result.fail(new IdentityApplicationError(error.message, error.code));
      }
      throw error;
    }

    const identity = await this.identityRepository.findById(identityId);
    if (!identity) {
      return Result.fail(new IdentityApplicationError('Identity not found', 'IDENTITY_NOT_FOUND'));
    }

    const change = command.locked ? identity.lock() : identity.unlock();
    if (change.isFailure) {
      const error = change.getError();
      return Result.fail(new IdentityApplicationError(error.message, error.code));
    }

    await this.identityRepository.save(identity);

    await this.auditLogger.log({
      actorId: command.actorId,
      action: command.locked ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED',
      resource: 'identity',
      resourceId: identity.id,
      requestId: command.requestContext?.requestId,
      correlationId: command.requestContext?.correlationId,
      metadata: { locked: command.locked },
    });

    return Result.ok({
      id: identity.id,
      status: identity.getStatus().value,
      disabled: identity.isDisabled(),
    });
  }
}
