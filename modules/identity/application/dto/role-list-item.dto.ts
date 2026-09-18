export interface RoleListItemDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly permissions: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly memberCount: number;
}

export interface RoleMemberDto {
  readonly id: string;
  readonly email: string;
  readonly status: string;
  readonly createdAt: string;
}
