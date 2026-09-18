import { getApiClient } from '@/lib/api/client';
import type {
  AssignPermissionRequest,
  CreateRoleRequest,
  CreateRoleResponse,
  DuplicateRoleRequest,
  IRolesClient,
  PermissionDto,
  RoleDto,
  RoleMemberDto,
  UpdateRolePermissionsRequest,
  UpdateRoleRequest,
} from './types';

function createGatewayRolesClient(): IRolesClient {
  return {
    listRoles(): Promise<RoleDto[]> {
      return getApiClient().get<RoleDto[]>('/roles');
    },

    listPermissions(): Promise<PermissionDto[]> {
      return getApiClient().get<PermissionDto[]>('/permissions');
    },

    listRoleMembers(roleId: string): Promise<RoleMemberDto[]> {
      return getApiClient().get<RoleMemberDto[]>(`/roles/${encodeURIComponent(roleId)}/users`);
    },

    createRole(data: CreateRoleRequest): Promise<CreateRoleResponse> {
      return getApiClient().post<CreateRoleResponse>('/roles', data);
    },

    updateRole(roleId: string, data: UpdateRoleRequest): Promise<RoleDto> {
      return getApiClient().patch<RoleDto>(`/roles/${encodeURIComponent(roleId)}`, data);
    },

    deleteRole(roleId: string): Promise<void> {
      return getApiClient().delete<void>(`/roles/${encodeURIComponent(roleId)}`);
    },

    duplicateRole(roleId: string, data?: DuplicateRoleRequest): Promise<RoleDto> {
      return getApiClient().post<RoleDto>(`/roles/${encodeURIComponent(roleId)}/duplicate`, data ?? {});
    },

    assignPermission(roleId: string, data: AssignPermissionRequest): Promise<void> {
      return getApiClient().post<void>(`/roles/${encodeURIComponent(roleId)}/permissions`, data);
    },

    updatePermissions(roleId: string, data: UpdateRolePermissionsRequest): Promise<RoleDto> {
      return getApiClient().patch<RoleDto>(`/roles/${encodeURIComponent(roleId)}/permissions`, data);
    },

    revokePermission(roleId: string, permissionKey: string): Promise<void> {
      const params = new URLSearchParams({ key: permissionKey });
      return getApiClient().delete<void>(
        `/roles/${encodeURIComponent(roleId)}/permissions?${params.toString()}`,
      );
    },
  };
}

export function createRolesClient(): IRolesClient {
  return createGatewayRolesClient();
}

export const rolesClient: IRolesClient = createRolesClient();
