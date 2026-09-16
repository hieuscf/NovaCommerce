import { getApiClient } from '@/lib/api/client';
import type {
  AddressRequest,
  CreateProfileRequest,
  IUserClient,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
  UserAccountDto,
  UserAddressDto,
  UserPreferenceDto,
  UserProfileDto,
} from './types';

function createGatewayUserClient(): IUserClient {
  return {
    getProfile(): Promise<UserProfileDto> {
      return getApiClient().get<UserProfileDto>('/users/me');
    },

    getAccount(): Promise<UserAccountDto> {
      return getApiClient().get<UserAccountDto>('/users/me/account');
    },

    createProfile(data: CreateProfileRequest): Promise<UserProfileDto> {
      return getApiClient().post<UserProfileDto>('/users/me', data);
    },

    updateProfile(data: UpdateProfileRequest): Promise<UserProfileDto> {
      return getApiClient().patch<UserProfileDto>('/users/me', data);
    },

    getAddresses(): Promise<UserAddressDto[]> {
      return getApiClient().get<UserAddressDto[]>('/users/me/addresses');
    },

    addAddress(data: AddressRequest): Promise<UserAddressDto> {
      return getApiClient().post<UserAddressDto>('/users/me/addresses', data);
    },

    updateAddress(addressId: string, data: AddressRequest): Promise<UserAddressDto> {
      return getApiClient().patch<UserAddressDto>(`/users/me/addresses/${addressId}`, data);
    },

    deleteAddress(addressId: string): Promise<void> {
      return getApiClient().delete<void>(`/users/me/addresses/${addressId}`);
    },

    setDefaultAddress(addressId: string): Promise<UserAddressDto> {
      return getApiClient().post<UserAddressDto>(`/users/me/addresses/${addressId}/default`);
    },

    getPreferences(): Promise<UserPreferenceDto[]> {
      return getApiClient().get<UserPreferenceDto[]>('/users/me/preferences');
    },

    updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferenceDto[]> {
      return getApiClient().patch<UserPreferenceDto[]>('/users/me/preferences', data);
    },
  };
}

export function createUserClient(): IUserClient {
  return createGatewayUserClient();
}

export const userClient: IUserClient = createUserClient();
