export interface UserProfileResponseDto {
  readonly userId: string;
  readonly identityId: string;
  readonly displayName: string;
  readonly phoneNumber?: string;
  readonly avatarUrl?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserAccountResponseDto {
  readonly userId: string;
  readonly identityId: string;
  readonly profile: UserProfileResponseDto;
  readonly addressCount: number;
  readonly preferenceCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserAddressResponseDto {
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

export interface UserPreferenceResponseDto {
  readonly key: string;
  readonly value: string;
  readonly updatedAt: string;
}
