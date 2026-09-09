import type { Identity } from '../aggregates/identity';
import type { EmailAddress } from '../value-objects/email-address';
import type { IdentityId } from '../value-objects/identity-id';

export interface IIdentityRepository {
  findById(id: IdentityId): Promise<Identity | null>;
  findByEmail(email: EmailAddress): Promise<Identity | null>;
  save(identity: Identity): Promise<void>;
}
