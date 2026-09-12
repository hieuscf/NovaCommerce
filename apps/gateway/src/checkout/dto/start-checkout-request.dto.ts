import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class StartCheckoutRequestDto {
  @ApiProperty({ description: 'Warehouse used for inventory validation' })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({ description: 'Customer shipping address id' })
  @IsUUID()
  shippingAddressId!: string;

  @ApiPropertyOptional({ description: 'Optional coupon code' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  couponCode?: string;
}
