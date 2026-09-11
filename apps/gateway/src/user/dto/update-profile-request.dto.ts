import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

export class UpdateProfileRequestDto {
  @ApiPropertyOptional({ example: 'Jane Doe', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ example: '+84901234567', nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  phoneNumber?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUrl()
  avatarUrl?: string | null;
}
