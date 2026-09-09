import type { User } from '../aggregates/user';
import type { UserId } from '../value-objects/user-id';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByIdentityId(identityId: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
