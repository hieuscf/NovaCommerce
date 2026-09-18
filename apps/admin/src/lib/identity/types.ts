export interface RoleDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly permissions: readonly string[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly memberCount?: number;
}

export interface PermissionDto {
  readonly id: string;
  readonly key: string;
}

export interface RoleMemberDto {
  readonly id: string;
  readonly email: string;
  readonly status: string;
  readonly createdAt: string;
}

export interface CreateRoleRequest {
  readonly name: string;
  readonly description?: string;
}

export interface CreateRoleResponse {
  readonly id: string;
  readonly name: string;
}

export interface UpdateRoleRequest {
  readonly name?: string;
  readonly description?: string;
}

export interface DuplicateRoleRequest {
  readonly name?: string;
  readonly description?: string;
}

export interface AssignPermissionRequest {
  readonly permissionKey: string;
}

export interface RolePermissionChangeRequest {
  readonly permissionKey: string;
  readonly granted: boolean;
}

export interface UpdateRolePermissionsRequest {
  readonly changes: readonly RolePermissionChangeRequest[];
}

export interface AuthenticationResponse {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly refreshToken: string;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface IRolesClient {
  listRoles(): Promise<RoleDto[]>;
  listPermissions(): Promise<PermissionDto[]>;
  listRoleMembers(roleId: string): Promise<RoleMemberDto[]>;
  createRole(data: CreateRoleRequest): Promise<CreateRoleResponse>;
  updateRole(roleId: string, data: UpdateRoleRequest): Promise<RoleDto>;
  deleteRole(roleId: string): Promise<void>;
  duplicateRole(roleId: string, data?: DuplicateRoleRequest): Promise<RoleDto>;
  assignPermission(roleId: string, data: AssignPermissionRequest): Promise<void>;
  updatePermissions(roleId: string, data: UpdateRolePermissionsRequest): Promise<RoleDto>;
  revokePermission(roleId: string, permissionKey: string): Promise<void>;
}

export interface IAdminAuthClient {
  login(credentials: LoginRequest): Promise<AuthenticationResponse>;
}
