import type { User } from '../../domain/aggregates/user';
import type { UserAddress } from '../../domain/entities/user-address';
import type { UserPreference } from '../../domain/entities/user-preference';
import type {
  UserAccountResponseDto,
  UserAddressResponseDto,
  UserPreferenceResponseDto,
  UserProfileResponseDto,
} from '../dto/user-response.dto';

export function mapUserProfileToDto(user: User): UserProfileResponseDto {
  const profile = user.getProfile();
  return {
    userId: user.id,
    identityId: user.getIdentityId(),
    displayName: profile.getDisplayName().value,
    phoneNumber: profile.getPhoneNumber()?.value,
    avatarUrl: profile.getAvatarUrl(),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function mapUserAccountToDto(user: User): UserAccountResponseDto {
  return {
    userId: user.id,
    identityId: user.getIdentityId(),
    profile: mapUserProfileToDto(user),
    addressCount: user.getAddresses().length,
    preferenceCount: user.getPreferences().length,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function mapUserAddressToDto(address: UserAddress): UserAddressResponseDto {
  const value = address.getAddress();
  return {
    id: address.id,
    label: address.getLabel(),
    line1: value.line1,
    line2: value.line2,
    city: value.city,
    state: value.state,
    postalCode: value.postalCode,
    country: value.country,
    isDefault: address.isDefaultAddress(),
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

export function mapUserPreferenceToDto(preference: UserPreference): UserPreferenceResponseDto {
  return {
    key: preference.getKey().value,
    value: preference.getValue(),
    updatedAt: preference.updatedAt.toISOString(),
  };
}
