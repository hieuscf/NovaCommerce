import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class OAuthCallbackRequestDto {
  @ApiProperty({ example: 'google' })
  @IsString()
  provider!: string;

  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  state!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  redirectUri!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codeVerifier?: string;
}
