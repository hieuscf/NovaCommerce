import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { Role } from '../../domain/entities/role';
import type { RoleListItemDto } from '../dto/role-list-item.dto';
import { mapRoleToListItem } from '../mappers/map-role-to-list-item';

export interface DuplicateRoleCommand {
  readonly roleId: string;
  readonly name?: string;
  readonly description?: string;
  readonly actorId: string;
}

export class DuplicateRoleHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute(
    command: DuplicateRoleCommand,
  ): Promise<Result<RoleListItemDto, IdentityApplicationError>> {
    const canCreate = await this.authorizationService.can(command.actorId, 'identity:role:create');
    if (!canCreate) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    const source = await this.roleRepository.findById(command.roleId);
    if (!source) {
      return Result.fail(new IdentityApplicationError('Role not found', 'ROLE_NOT_FOUND'));
    }

    const name = (command.name?.trim() || `${source.getName()}_copy`).toLowerCase();
    const existing = await this.roleRepository.findByName(name);
    if (existing) {
      return Result.fail(new IdentityApplicationError('Role already exists', 'ROLE_ALREADY_EXISTS'));
    }

    const duplicate = Role.create(
      randomUUID(),
      name,
      command.description ?? source.getDescription(),
    );
    for (const key of source.getPermissionKeys()) {
      duplicate.assignPermission(key);
    }

    await this.roleRepository.save(duplicate);
    return Result.ok(mapRoleToListItem(duplicate, 0));
  }
}
