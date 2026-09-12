import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductRequestDto {
  @ApiProperty({ example: 'Nova Wireless Headphones', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'nova-wireless-headphones' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  basePriceAmount!: number;

  @ApiProperty({ example: 'USD', minLength: 3, maxLength: 3 })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  basePriceCurrency!: string;

  @ApiPropertyOptional({ example: '44444444-4444-4444-4444-444444444444' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
