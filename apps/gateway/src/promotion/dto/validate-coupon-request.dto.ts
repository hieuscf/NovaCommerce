import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class ValidateCouponRequestDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  @MinLength(1)
  couponCode!: string;

  @ApiProperty({ example: 10000, description: 'Cart subtotal in minor units or decimal amount' })
  @IsNumber()
  @Min(0)
  subtotalAmount!: number;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  customerId!: string;
}
