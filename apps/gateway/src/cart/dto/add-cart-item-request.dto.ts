import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class AddCartItemRequestDto {
  @ApiProperty({ description: 'Catalog product ID' })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({ description: 'Catalog variant ID' })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  unitPriceAmount!: number;

  @ApiProperty({ minLength: 3, maxLength: 3, example: 'USD' })
  @IsString()
  @Length(3, 3)
  unitPriceCurrency!: string;
}
