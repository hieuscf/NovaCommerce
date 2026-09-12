import type { PaymentStatus } from '../../domain/aggregates/payment';

export interface PaymentResponseDto {
  readonly id: string;
  readonly reference: string;
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly method: string;
  readonly status: PaymentStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PaymentInitiationResponseDto extends PaymentResponseDto {
  readonly provider: string;
  readonly redirectUrl: string;
}
