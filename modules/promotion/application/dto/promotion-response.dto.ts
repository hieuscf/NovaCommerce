export interface CouponValidationResponseDto {
  readonly couponCode: string;
  readonly promotionId: string;
  readonly promotionName: string;
  readonly remainingRedemptions: number;
}

export interface DiscountCalculationResponseDto {
  readonly couponCode: string;
  readonly discountAmount: number;
  readonly currency: string;
  readonly label: string;
}

export interface CouponUsageResponseDto {
  readonly couponCode: string;
  readonly orderId: string;
  readonly remainingRedemptions: number;
}
