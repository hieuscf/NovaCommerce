import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, Length, Min, MinLength } from 'class-validator';

export class CalculateDiscountRequestDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  @MinLength(1)
  couponCode!: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  subtotalAmount!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Length(3, 3)
  currency!: string;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  customerId!: string;
}
