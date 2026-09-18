import type { Role } from '../../domain/entities/role';
import type { RoleListItemDto } from '../dto/role-list-item.dto';

export function mapRoleToListItem(role: Role, memberCount: number): RoleListItemDto {
  return {
    id: role.id,
    name: role.getName(),
    description: role.getDescription() ?? null,
    permissions: role.getPermissionKeys().map((key) => key.value),
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
    memberCount,
  };
}
