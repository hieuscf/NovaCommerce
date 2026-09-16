import type {
  AccountAddressViewModel,
  AccountProfileViewModel,
  AccountStatViewModel,
} from '@/lib/view-models/account';
import type { UserAccountDto, UserAddressDto, UserPreferenceDto, UserProfileDto } from './types';

export function mapProfileToViewModel(profile: UserProfileDto): AccountProfileViewModel {
  return {
    name: profile.displayName,
    phoneNumber: profile.phoneNumber,
    avatarUrl: profile.avatarUrl,
    membershipLabel: 'Member',
    membershipNote: 'Manage your profile, addresses, and preferences.',
  };
}

export function mapAccountStats(account: UserAccountDto): readonly AccountStatViewModel[] {
  return [
    {
      id: 'addresses',
      value: String(account.addressCount),
      label: 'Saved Addresses',
    },
    {
      id: 'preferences',
      value: String(account.preferenceCount),
      label: 'Preferences',
    },
    {
      id: 'member',
      value: 'Active',
      label: 'Account Status',
    },
  ];
}

export function mapAddressToViewModel(address: UserAddressDto): AccountAddressViewModel {
  const cityLine = [address.city, address.state, address.postalCode].filter(Boolean).join(', ');
  const secondary = [cityLine, address.country].filter(Boolean).join(' · ');

  return {
    id: address.id,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    formattedSecondary: secondary,
  };
}

export function preferenceMap(preferences: readonly UserPreferenceDto[]): Record<string, string> {
  return Object.fromEntries(preferences.map((item) => [item.key, item.value]));
}

export function isPreferenceEnabled(preferences: Record<string, string>, key: string): boolean {
  const value = preferences[key];
  return value === 'true' || value === '1' || value === 'yes';
}
