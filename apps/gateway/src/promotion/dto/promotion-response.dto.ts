import { ApiProperty } from '@nestjs/swagger';

export class CouponValidationEnvelopeDto {
  @ApiProperty({ example: 'SAVE10' })
  couponCode!: string;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  promotionId!: string;

  @ApiProperty({ example: 'Spring Sale' })
  promotionName!: string;

  @ApiProperty({ example: 5 })
  remainingRedemptions!: number;
}

export class DiscountCalculationEnvelopeDto {
  @ApiProperty({ example: 'SAVE10' })
  couponCode!: string;

  @ApiProperty({ example: 1000 })
  discountAmount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: 'Coupon SAVE10' })
  label!: string;
}
