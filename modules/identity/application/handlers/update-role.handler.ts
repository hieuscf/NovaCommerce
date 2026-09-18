import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import type { RoleListItemDto } from '../dto/role-list-item.dto';
import { mapRoleToListItem } from '../mappers/map-role-to-list-item';

export interface UpdateRoleCommand {
  readonly roleId: string;
  readonly name?: string;
  readonly description?: string;
  readonly actorId: string;
}

export class UpdateRoleHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute(
    command: UpdateRoleCommand,
  ): Promise<Result<RoleListItemDto, IdentityApplicationError>> {
    const canEdit = await this.authorizationService.can(command.actorId, 'identity:role:edit');
    if (!canEdit) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      return Result.fail(new IdentityApplicationError('Role not found', 'ROLE_NOT_FOUND'));
    }

    if (command.name !== undefined && command.name.trim().toLowerCase() !== role.getName()) {
      const renamed = role.rename(command.name);
      if (renamed.isFailure) {
        return Result.fail(
          new IdentityApplicationError(renamed.getError().message, renamed.getError().code),
        );
      }

      const existing = await this.roleRepository.findByName(role.getName());
      if (existing && existing.id !== role.id) {
        return Result.fail(new IdentityApplicationError('Role already exists', 'ROLE_ALREADY_EXISTS'));
      }
    }

    if (command.description !== undefined) {
      role.changeDescription(command.description);
    }

    await this.roleRepository.save(role);
    return Result.ok(mapRoleToListItem(role, 0));
  }
}
