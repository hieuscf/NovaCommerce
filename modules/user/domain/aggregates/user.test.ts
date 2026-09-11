import { describe, expect, it } from 'vitest';
import { User } from './user';
import { UserAddress } from '../entities/user-address';
import { UserProfile } from '../entities/user-profile';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';
import { Address } from '../value-objects/address';
import { DisplayName } from '../value-objects/display-name';
import { PhoneNumber } from '../value-objects/phone-number';
import { PreferenceKey } from '../value-objects/preference-key';
import { UserId } from '../value-objects/user-id';

describe('User aggregate', () => {
  const userId = UserId.create('11111111-1111-1111-1111-111111111111');
  const identityId = '22222222-2222-2222-2222-222222222222';
  const profile = UserProfile.create(userId.value, DisplayName.create('Jane Doe'));

  function createUser(): User {
    return User.create(userId, identityId, profile).getValue();
  }

  it('creates user with UserCreated event', () => {
    const user = createUser();
    const events = user.pullDomainEvents();

    expect(user.getIdentityId()).toBe(identityId);
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UserCreatedEvent);
  });

  it('rejects user without identity id', () => {
    const result = User.create(userId, ' ', profile);
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_IDENTITY_ID');
  });

  it('updates profile and emits UserProfileUpdated', () => {
    const user = createUser();
    user.pullDomainEvents();

    const result = user.updateProfile({
      displayName: DisplayName.create('John Doe'),
      phoneNumber: PhoneNumber.create('+84901234567'),
    });

    expect(result.isSuccess).toBe(true);
    const events = user.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UserProfileUpdatedEvent);
    expect(user.getProfile().getDisplayName().value).toBe('John Doe');
  });

  it('adds address and sets first address as default', () => {
    const user = createUser();
    const address = UserAddress.create(
      'addr-1',
      'Home',
      Address.create({
        line1: '123 Main St',
        city: 'Hanoi',
        state: 'HN',
        postalCode: '100000',
        country: 'VN',
      }),
    );

    user.addAddress(address);
    expect(user.getAddresses()).toHaveLength(1);
    expect(user.getAddresses()[0]?.isDefaultAddress()).toBe(true);
  });

  it('enforces single default address', () => {
    const user = createUser();
    const first = UserAddress.create(
      'addr-1',
      'Home',
      Address.create({
        line1: '123 Main St',
        city: 'Hanoi',
        state: 'HN',
        postalCode: '100000',
        country: 'VN',
      }),
      true,
    );
    const second = UserAddress.create(
      'addr-2',
      'Office',
      Address.create({
        line1: '456 Work Ave',
        city: 'Hanoi',
        state: 'HN',
        postalCode: '100001',
        country: 'VN',
      }),
      true,
    );

    user.addAddress(first);
    user.addAddress(second);

    const defaults = user.getAddresses().filter((item) => item.isDefaultAddress());
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.id).toBe('addr-2');
  });

  it('sets default address explicitly', () => {
    const user = createUser();
    user.addAddress(
      UserAddress.create(
        'addr-1',
        'Home',
        Address.create({
          line1: '123 Main St',
          city: 'Hanoi',
          state: 'HN',
          postalCode: '100000',
          country: 'VN',
        }),
        true,
      ),
    );
    user.addAddress(
      UserAddress.create(
        'addr-2',
        'Office',
        Address.create({
          line1: '456 Work Ave',
          city: 'Hanoi',
          state: 'HN',
          postalCode: '100001',
          country: 'VN',
        }),
      ),
    );

    const result = user.setDefaultAddress('addr-2');
    expect(result.isSuccess).toBe(true);
    expect(user.getAddresses().find((item) => item.id === 'addr-2')?.isDefaultAddress()).toBe(true);
    expect(user.getAddresses().find((item) => item.id === 'addr-1')?.isDefaultAddress()).toBe(false);
  });

  it('returns error when setting already default address', () => {
    const user = createUser();
    user.addAddress(
      UserAddress.create(
        'addr-1',
        'Home',
        Address.create({
          line1: '123 Main St',
          city: 'Hanoi',
          state: 'HN',
          postalCode: '100000',
          country: 'VN',
        }),
        true,
      ),
    );

    const result = user.setDefaultAddress('addr-1');
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ADDRESS_ALREADY_DEFAULT');
  });

  it('removes address and promotes next default', () => {
    const user = createUser();
    user.addAddress(
      UserAddress.create(
        'addr-1',
        'Home',
        Address.create({
          line1: '123 Main St',
          city: 'Hanoi',
          state: 'HN',
          postalCode: '100000',
          country: 'VN',
        }),
        true,
      ),
    );
    user.addAddress(
      UserAddress.create(
        'addr-2',
        'Office',
        Address.create({
          line1: '456 Work Ave',
          city: 'Hanoi',
          state: 'HN',
          postalCode: '100001',
          country: 'VN',
        }),
      ),
    );

    const result = user.removeAddress('addr-1');
    expect(result.isSuccess).toBe(true);
    expect(user.getAddresses()).toHaveLength(1);
    expect(user.getAddresses()[0]?.isDefaultAddress()).toBe(true);
  });

  it('upserts preferences by key', () => {
    const user = createUser();
    const key = PreferenceKey.create('language');

    user.upsertPreference(key, 'vi', 'pref-1');
    user.upsertPreference(key, 'en', 'pref-2');

    expect(user.getPreferences()).toHaveLength(1);
    expect(user.getPreferences()[0]?.getValue()).toBe('en');
  });
});
