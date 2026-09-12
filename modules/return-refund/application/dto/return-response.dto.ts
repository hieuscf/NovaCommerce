export interface ReturnRequestResponseDto {
  readonly id: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly paymentId: string;
  readonly status: string;
  readonly refundAmount: number;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
