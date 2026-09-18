import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IPermissionRepository } from '../../domain/repositories/i-permission-repository';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { PermissionKey } from '../../domain/value-objects/permission-key';

export interface RevokePermissionFromRoleCommand {
  readonly roleId: string;
  readonly permissionKey: string;
  readonly actorId: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
  };
}

export class RevokePermissionFromRoleHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(
    command: RevokePermissionFromRoleCommand,
  ): Promise<Result<void, IdentityApplicationError>> {
    const canAssign = await this.authorizationService.can(
      command.actorId,
      'identity:permission:assign',
    );
    if (!canAssign) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      return Result.fail(new IdentityApplicationError('Role not found', 'ROLE_NOT_FOUND'));
    }

    const key = PermissionKey.create(command.permissionKey);
    const permission = await this.permissionRepository.findByKey(key);
    if (!permission) {
      return Result.fail(new IdentityApplicationError('Permission not found', 'PERMISSION_NOT_FOUND'));
    }

    role.removePermission(key);
    await this.roleRepository.save(role);

    await this.auditLogger.log({
      actorId: command.actorId,
      action: 'PERMISSION_CHANGED',
      resource: 'role',
      resourceId: role.id,
      requestId: command.requestContext?.requestId,
      correlationId: command.requestContext?.correlationId,
      metadata: { permissionKey: key.value, revoked: true },
    });

    return Result.ok(undefined);
  }
}
