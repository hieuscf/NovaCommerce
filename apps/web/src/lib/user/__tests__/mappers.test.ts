import { describe, expect, it } from 'vitest';
import {
  mapAccountStats,
  mapAddressToViewModel,
  mapProfileToViewModel,
} from '../mappers';

describe('user mappers', () => {
  it('maps profile fields for the account UI', () => {
    expect(
      mapProfileToViewModel({
        userId: 'u1',
        identityId: 'i1',
        displayName: 'Jane Doe',
        phoneNumber: '+84901234567',
        createdAt: '2026-09-12T00:00:00.000Z',
        updatedAt: '2026-09-12T00:00:00.000Z',
      }),
    ).toEqual({
      name: 'Jane Doe',
      phoneNumber: '+84901234567',
      avatarUrl: undefined,
      membershipLabel: 'Member',
      membershipNote: 'Manage your profile, addresses, and preferences.',
    });
  });

  it('maps account summary counts into stats', () => {
    expect(
      mapAccountStats({
        userId: 'u1',
        identityId: 'i1',
        profile: {
          userId: 'u1',
          identityId: 'i1',
          displayName: 'Jane',
          createdAt: '2026-09-12T00:00:00.000Z',
          updatedAt: '2026-09-12T00:00:00.000Z',
        },
        addressCount: 2,
        preferenceCount: 3,
        createdAt: '2026-09-12T00:00:00.000Z',
        updatedAt: '2026-09-12T00:00:00.000Z',
      }),
    ).toEqual([
      { id: 'addresses', value: '2', label: 'Saved Addresses' },
      { id: 'preferences', value: '3', label: 'Preferences' },
      { id: 'member', value: 'Active', label: 'Account Status' },
    ]);
  });

  it('formats address secondary lines', () => {
    expect(
      mapAddressToViewModel({
        id: 'a1',
        label: 'Home',
        line1: '123 Main St',
        line2: 'Apt 4',
        city: 'Hanoi',
        state: 'HN',
        postalCode: '100000',
        country: 'VN',
        isDefault: true,
        createdAt: '2026-09-12T00:00:00.000Z',
        updatedAt: '2026-09-12T00:00:00.000Z',
      }).formattedSecondary,
    ).toBe('Hanoi, HN, 100000 · VN');
  });
});
