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

export interface IdentityAccountDto {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly status: string;
  readonly disabled: boolean;
  readonly roles: readonly string[];
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
}

export interface IdentityAccountSummaryDto {
  readonly total: number;
  readonly customers: number;
  readonly admins: number;
  readonly blocked: number;
}

export interface IdentityAccountListDto {
  readonly items: readonly IdentityAccountDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly summary: IdentityAccountSummaryDto;
}

export interface IdentityLockResultDto {
  readonly id: string;
  readonly status: string;
  readonly disabled: boolean;
}

export interface ListIdentitiesQuery {
  readonly q?: string;
  readonly role?: 'customer' | 'admin';
  readonly status?: 'active' | 'inactive' | 'blocked';
  readonly page?: number;
  readonly pageSize?: number;
}

export interface IIdentitiesClient {
  listIdentities(query: ListIdentitiesQuery): Promise<IdentityAccountListDto>;
  updateIdentityLock(identityId: string, locked: boolean): Promise<IdentityLockResultDto>;
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
