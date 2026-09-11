import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { IdentityId } from '../../domain/value-objects/identity-id';

export interface RevokeRoleCommand {
  readonly identityId: string;
  readonly roleId: string;
  readonly actorId: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
  };
}

export class RevokeRoleHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: RevokeRoleCommand): Promise<Result<void, IdentityApplicationError>> {
    const canRevoke = await this.authorizationService.can(command.actorId, 'identity:role:revoke');
    if (!canRevoke) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    const identity = await this.identityRepository.findById(IdentityId.create(command.identityId));
    if (!identity) {
      return Result.fail(new IdentityApplicationError('Identity not found', 'IDENTITY_NOT_FOUND'));
    }

    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      return Result.fail(new IdentityApplicationError('Role not found', 'ROLE_NOT_FOUND'));
    }

    const revokeResult = identity.revokeRole(role.id, role.getName());
    if (revokeResult.isFailure) {
      return Result.fail(new IdentityApplicationError(revokeResult.getError().message, revokeResult.getError().code));
    }

    await this.identityRepository.save(identity);
    await this.auditLogger.log({
      actorId: command.actorId,
      action: 'ROLE_REMOVED',
      resource: 'identity',
      resourceId: identity.id,
      requestId: command.requestContext?.requestId,
      correlationId: command.requestContext?.correlationId,
      metadata: { roleId: role.id, roleName: role.getName() },
    });

    return Result.ok(undefined);
  }
}
