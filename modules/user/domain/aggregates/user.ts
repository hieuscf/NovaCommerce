import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { UserDomainError } from '../errors/user-domain.error';
import { UserAddress } from '../entities/user-address';
import { UserPreference } from '../entities/user-preference';
import { UserProfile } from '../entities/user-profile';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';
import type { DisplayName } from '../value-objects/display-name';
import type { UserId } from '../value-objects/user-id';

export class User extends AggregateRoot<string> {
  private addresses: UserAddress[] = [];
  private preferences: UserPreference[] = [];

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private identityId: string,
    private profile: UserProfile,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: UserId, identityId: string, profile: UserProfile): Result<User, UserDomainError> {
    if (!identityId?.trim()) {
      return Result.fail(new UserDomainError('Identity id is required', 'INVALID_IDENTITY_ID'));
    }
    const now = new Date();
    const user = new User(id.value, now, now, identityId.trim(), profile);
    user.addDomainEvent(new UserCreatedEvent(id.value, now, { identityId: identityId.trim() }));
    return Result.ok(user);
  }

  static reconstitute(props: {
    id: string;
    identityId: string;
    profile: UserProfile;
    createdAt: Date;
    updatedAt: Date;
    addresses: UserAddress[];
    preferences: UserPreference[];
  }): User {
    const user = new User(props.id, props.createdAt, props.updatedAt, props.identityId, props.profile);
    user.addresses = [...props.addresses];
    user.preferences = [...props.preferences];
    return user;
  }

  updateProfile(displayName: DisplayName): Result<void, UserDomainError> {
    this.profile.updateDisplayName(displayName);
    this.updatedAt = new Date();
    this.addDomainEvent(new UserProfileUpdatedEvent(this.id, new Date(), { displayName: displayName.value }));
    return Result.ok(undefined);
  }

  addAddress(address: UserAddress): void {
    this.addresses.push(address);
    this.updatedAt = new Date();
  }

  addPreference(preference: UserPreference): void {
    this.preferences.push(preference);
    this.updatedAt = new Date();
  }

  getIdentityId(): string { return this.identityId; }
  getProfile(): UserProfile { return this.profile; }
  getAddresses(): readonly UserAddress[] { return this.addresses; }
  getPreferences(): readonly UserPreference[] { return this.preferences; }
}
