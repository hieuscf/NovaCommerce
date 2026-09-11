import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { UserDomainError } from '../errors/user-domain.error';
import { UserAddress } from '../entities/user-address';
import { UserPreference } from '../entities/user-preference';
import { UserProfile } from '../entities/user-profile';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';
import type { Address } from '../value-objects/address';
import type { DisplayName } from '../value-objects/display-name';
import type { PhoneNumber } from '../value-objects/phone-number';
import type { PreferenceKey } from '../value-objects/preference-key';
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

  updateProfile(props: {
    displayName?: DisplayName;
    phoneNumber?: PhoneNumber | null;
    avatarUrl?: string | null;
  }): Result<void, UserDomainError> {
    const payload: {
      displayName?: string;
      phoneNumber?: string | null;
      avatarUrl?: string | null;
    } = {};

    if (props.displayName) {
      this.profile.updateDisplayName(props.displayName);
      payload.displayName = props.displayName.value;
    }

    if (props.phoneNumber !== undefined) {
      this.profile.updatePhoneNumber(props.phoneNumber ?? undefined);
      payload.phoneNumber = props.phoneNumber?.value ?? null;
    }

    if (props.avatarUrl !== undefined) {
      this.profile.updateAvatarUrl(props.avatarUrl ?? undefined);
      payload.avatarUrl = props.avatarUrl?.trim() || null;
    }

    if (Object.keys(payload).length === 0) {
      return Result.fail(new UserDomainError('No profile fields to update', 'NO_PROFILE_CHANGES'));
    }

    this.updatedAt = new Date();
    this.addDomainEvent(new UserProfileUpdatedEvent(this.id, new Date(), payload));
    return Result.ok(undefined);
  }

  addAddress(address: UserAddress): Result<void, UserDomainError> {
    if (address.isDefaultAddress()) {
      this.clearDefaultAddresses();
    } else if (this.addresses.length === 0) {
      address.markDefault();
    }

    this.addresses.push(address);
    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  updateAddress(
    addressId: string,
    label: string,
    address: Address,
  ): Result<void, UserDomainError> {
    const existing = this.findAddress(addressId);
    if (!existing) {
      return Result.fail(new UserDomainError('Address not found', 'ADDRESS_NOT_FOUND'));
    }

    existing.update(label, address);
    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  removeAddress(addressId: string): Result<void, UserDomainError> {
    const index = this.addresses.findIndex((item) => item.id === addressId);
    if (index < 0) {
      return Result.fail(new UserDomainError('Address not found', 'ADDRESS_NOT_FOUND'));
    }

    const [removed] = this.addresses.splice(index, 1);
    if (removed?.isDefaultAddress() && this.addresses.length > 0) {
      this.addresses[0]?.markDefault();
    }

    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  setDefaultAddress(addressId: string): Result<void, UserDomainError> {
    const target = this.findAddress(addressId);
    if (!target) {
      return Result.fail(new UserDomainError('Address not found', 'ADDRESS_NOT_FOUND'));
    }

    if (target.isDefaultAddress()) {
      return Result.fail(new UserDomainError('Address is already default', 'ADDRESS_ALREADY_DEFAULT'));
    }

    this.clearDefaultAddresses();
    target.markDefault();
    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  upsertPreference(key: PreferenceKey, value: string, preferenceId: string): Result<void, UserDomainError> {
    const existing = this.preferences.find((item) => item.getKey().value === key.value);
    if (existing) {
      existing.updateValue(value);
    } else {
      this.preferences.push(UserPreference.create(preferenceId, key, value));
    }

    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  getIdentityId(): string {
    return this.identityId;
  }

  getProfile(): UserProfile {
    return this.profile;
  }

  getAddresses(): readonly UserAddress[] {
    return this.addresses;
  }

  getPreferences(): readonly UserPreference[] {
    return this.preferences;
  }

  private findAddress(addressId: string): UserAddress | undefined {
    return this.addresses.find((item) => item.id === addressId);
  }

  private clearDefaultAddresses(): void {
    for (const address of this.addresses) {
      if (address.isDefaultAddress()) {
        address.clearDefault();
      }
    }
  }
}
