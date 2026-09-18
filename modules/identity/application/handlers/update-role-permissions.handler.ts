import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { RoleListItemDto } from '../dto/role-list-item.dto';
import { mapRoleToListItem } from '../mappers/map-role-to-list-item';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import { IdentityDomainError } from '../../domain/errors/identity-domain.error';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IPermissionRepository } from '../../domain/repositories/i-permission-repository';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { PermissionKey } from '../../domain/value-objects/permission-key';

export interface RolePermissionChange {
  readonly permissionKey: string;
  readonly granted: boolean;
}

export interface UpdateRolePermissionsCommand {
  readonly roleId: string;
  readonly changes: readonly RolePermissionChange[];
  readonly actorId: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
  };
}

export class UpdateRolePermissionsHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly identityRepository: IIdentityRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(
    command: UpdateRolePermissionsCommand,
  ): Promise<Result<RoleListItemDto, IdentityApplicationError>> {
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

    const catalog = await this.permissionRepository.findAll();
    const catalogKeys = new Set(catalog.map((permission) => permission.getKey().value));

    for (const change of command.changes) {
      let key: PermissionKey;
      try {
        key = PermissionKey.create(change.permissionKey);
      } catch (error) {
        if (error instanceof IdentityDomainError) {
          return Result.fail(new IdentityApplicationError(error.message, error.code));
        }
        throw error;
      }

      if (!catalogKeys.has(key.value)) {
        return Result.fail(
          new IdentityApplicationError('Permission not found', 'PERMISSION_NOT_FOUND'),
        );
      }

      role.applyPermissionChange(key, change.granted);
    }

    await this.roleRepository.save(role);

    await this.auditLogger.log({
      actorId: command.actorId,
      action: 'PERMISSION_CHANGED',
      resource: 'role',
      resourceId: role.id,
      requestId: command.requestContext?.requestId,
      correlationId: command.requestContext?.correlationId,
      metadata: { changes: command.changes },
    });

    const counts = await this.identityRepository.countMembersByRoleIds([role.id]);
    return Result.ok(mapRoleToListItem(role, counts.get(role.id) ?? 0));
  }
}
