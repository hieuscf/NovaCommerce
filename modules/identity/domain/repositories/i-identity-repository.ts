import type { Identity } from '../aggregates/identity';
import type { EmailAddress } from '../value-objects/email-address';
import type { IdentityId } from '../value-objects/identity-id';

export interface IdentityRoleMemberRecord {
  readonly id: string;
  readonly email: string;
  readonly status: string;
  readonly createdAt: Date;
}

export interface IIdentityRepository {
  findById(id: IdentityId): Promise<Identity | null>;
  findByEmail(email: EmailAddress): Promise<Identity | null>;
  findMembersByRoleId(roleId: string): Promise<readonly IdentityRoleMemberRecord[]>;
  countMembersByRoleIds(roleIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
  save(identity: Identity): Promise<void>;
}
