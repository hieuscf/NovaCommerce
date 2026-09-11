import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class UserProfileResponseDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  userId!: string;

  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222' })
  identityId!: string;

  @ApiProperty({ example: 'Jane Doe' })
  displayName!: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  avatarUrl?: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class UserAccountResponseDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  userId!: string;

  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222' })
  identityId!: string;

  @ApiProperty({ type: () => UserProfileResponseDto })
  profile!: UserProfileResponseDto;

  @ApiProperty({ example: 2 })
  addressCount!: number;

  @ApiProperty({ example: 3 })
  preferenceCount!: number;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class UserAddressResponseDto {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  id!: string;

  @ApiProperty({ example: 'Home' })
  label!: string;

  @ApiProperty({ example: '123 Main St' })
  line1!: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  line2?: string;

  @ApiProperty({ example: 'Hanoi' })
  city!: string;

  @ApiProperty({ example: 'HN' })
  state!: string;

  @ApiProperty({ example: '100000' })
  postalCode!: string;

  @ApiProperty({ example: 'VN' })
  country!: string;

  @ApiProperty({ example: true })
  isDefault!: boolean;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class UserPreferenceResponseDto {
  @ApiProperty({
    example: 'language',
    enum: [
      'language',
      'currency',
      'marketing.email',
      'marketing.sms',
      'notifications.email',
      'notifications.push',
      'notifications.sms',
    ],
  })
  key!: string;

  @ApiProperty({ example: 'vi' })
  value!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

class UserProfileEnvelopeDto {
  @ApiProperty({ type: () => UserProfileResponseDto })
  data!: UserProfileResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

class UserAccountEnvelopeDto {
  @ApiProperty({ type: () => UserAccountResponseDto })
  data!: UserAccountResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

class UserAddressEnvelopeDto {
  @ApiProperty({ type: () => UserAddressResponseDto })
  data!: UserAddressResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

class UserAddressListEnvelopeDto {
  @ApiProperty({ type: () => [UserAddressResponseDto] })
  data!: UserAddressResponseDto[];

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

class UserPreferenceListEnvelopeDto {
  @ApiProperty({ type: () => [UserPreferenceResponseDto] })
  data!: UserPreferenceResponseDto[];

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export {
  UserProfileEnvelopeDto,
  UserAccountEnvelopeDto,
  UserAddressEnvelopeDto,
  UserAddressListEnvelopeDto,
  UserPreferenceListEnvelopeDto,
};
