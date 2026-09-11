import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddressRequestDto {
  @ApiProperty({ example: 'Home', maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  label!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @MinLength(1)
  line1!: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Hanoi' })
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiProperty({ example: 'HN' })
  @IsString()
  @MinLength(1)
  state!: string;

  @ApiProperty({ example: '100000' })
  @IsString()
  @MinLength(1)
  postalCode!: string;

  @ApiProperty({ example: 'VN' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
