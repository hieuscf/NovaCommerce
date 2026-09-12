export interface CheckoutLineResponseDto {
  readonly id: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly currency: string;
  readonly lineTotalAmount: number;
}

export interface CheckoutAdjustmentResponseDto {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly amount: number;
  readonly currency: string;
}

export interface CheckoutResponseDto {
  readonly id: string;
  readonly cartId: string;
  readonly customerId?: string;
  readonly status: string;
  readonly lines: readonly CheckoutLineResponseDto[];
  readonly adjustments: readonly CheckoutAdjustmentResponseDto[];
  readonly subtotalAmount: number;
  readonly totalAmount: number;
  readonly currency?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CheckoutPaymentResponseDto {
  readonly paymentId: string;
  readonly provider: string;
  readonly redirectUrl: string;
}

export interface CompleteCheckoutResponseDto extends CheckoutResponseDto {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly payment: CheckoutPaymentResponseDto;
}
