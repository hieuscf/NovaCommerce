export interface UserProfileDto {
  readonly userId: string;
  readonly identityId: string;
  readonly displayName: string;
  readonly phoneNumber?: string;
  readonly avatarUrl?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserAccountDto {
  readonly userId: string;
  readonly identityId: string;
  readonly profile: UserProfileDto;
  readonly addressCount: number;
  readonly preferenceCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserAddressDto {
  readonly id: string;
  readonly label: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type UserPreferenceKey =
  | 'language'
  | 'currency'
  | 'marketing.email'
  | 'marketing.sms'
  | 'notifications.email'
  | 'notifications.push'
  | 'notifications.sms';

export interface UserPreferenceDto {
  readonly key: UserPreferenceKey | string;
  readonly value: string;
  readonly updatedAt: string;
}

export interface CreateProfileRequest {
  readonly displayName: string;
  readonly phoneNumber?: string;
  readonly avatarUrl?: string;
}

export interface UpdateProfileRequest {
  readonly displayName?: string;
  readonly phoneNumber?: string | null;
  readonly avatarUrl?: string | null;
}

export interface AddressRequest {
  readonly label: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault?: boolean;
}

export interface UpdatePreferencesRequest {
  readonly preferences: readonly { readonly key: string; readonly value: string }[];
}

export interface IUserClient {
  getProfile(): Promise<UserProfileDto>;
  getAccount(): Promise<UserAccountDto>;
  createProfile(data: CreateProfileRequest): Promise<UserProfileDto>;
  updateProfile(data: UpdateProfileRequest): Promise<UserProfileDto>;
  getAddresses(): Promise<UserAddressDto[]>;
  addAddress(data: AddressRequest): Promise<UserAddressDto>;
  updateAddress(addressId: string, data: AddressRequest): Promise<UserAddressDto>;
  deleteAddress(addressId: string): Promise<void>;
  setDefaultAddress(addressId: string): Promise<UserAddressDto>;
  getPreferences(): Promise<UserPreferenceDto[]>;
  updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferenceDto[]>;
}
