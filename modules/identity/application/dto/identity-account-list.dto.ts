export interface IdentityAccountListItemDto {
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

export interface IdentityAccountListResultDto {
  readonly items: readonly IdentityAccountListItemDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly summary: IdentityAccountSummaryDto;
}
