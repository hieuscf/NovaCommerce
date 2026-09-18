import type { Identity } from '../aggregates/identity';
import type { EmailAddress } from '../value-objects/email-address';
import type { IdentityId } from '../value-objects/identity-id';

export interface IdentityRoleMemberRecord {
  readonly id: string;
  readonly email: string;
  readonly status: string;
  readonly createdAt: Date;
}

export type IdentityAccountRoleFilter = 'customer' | 'admin';
export type IdentityAccountStatusFilter = 'active' | 'inactive' | 'blocked';

export interface IdentityAccountSearchQuery {
  readonly q?: string;
  readonly role?: IdentityAccountRoleFilter;
  readonly status?: IdentityAccountStatusFilter;
  readonly page: number;
  readonly pageSize: number;
}

export interface IdentityAccountRecord {
  readonly id: string;
  readonly email: string;
  readonly status: string;
  readonly disabled: boolean;
  readonly roleNames: readonly string[];
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
}

export interface IdentityAccountSummary {
  readonly total: number;
  readonly customers: number;
  readonly admins: number;
  readonly blocked: number;
}

export interface IdentityAccountSearchResult {
  readonly items: readonly IdentityAccountRecord[];
  readonly total: number;
  readonly summary: IdentityAccountSummary;
}

export interface IIdentityRepository {
  findById(id: IdentityId): Promise<Identity | null>;
  findByEmail(email: EmailAddress): Promise<Identity | null>;
  findMembersByRoleId(roleId: string): Promise<readonly IdentityRoleMemberRecord[]>;
  countMembersByRoleIds(roleIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
  searchAccounts(query: IdentityAccountSearchQuery): Promise<IdentityAccountSearchResult>;
  save(identity: Identity): Promise<void>;
}
