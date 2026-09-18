import type { RoleListItemDto } from '../dto/role-list-item.dto';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { mapRoleToListItem } from '../mappers/map-role-to-list-item';

export class ListRolesHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly identityRepository: IIdentityRepository,
  ) {}

  async execute(): Promise<RoleListItemDto[]> {
    const roles = await this.roleRepository.findAll();
    const counts = await this.identityRepository.countMembersByRoleIds(roles.map((role) => role.id));
    return roles.map((role) => mapRoleToListItem(role, counts.get(role.id) ?? 0));
  }
}
