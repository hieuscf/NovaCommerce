import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class PreferenceItemRequestDto {
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
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  key!: string;

  @ApiProperty({ example: 'vi' })
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  value!: string;
}

export class UpdatePreferencesRequestDto {
  @ApiProperty({ type: [PreferenceItemRequestDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PreferenceItemRequestDto)
  preferences!: PreferenceItemRequestDto[];
}
