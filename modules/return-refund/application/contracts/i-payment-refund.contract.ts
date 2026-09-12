import type { Result } from '@novacommerce/building-blocks';
import type { ReturnRefundApplicationError } from '../errors/return-refund-application.error';

export interface PaymentRefundRequest {
  readonly paymentId: string;
  readonly amount: number;
}

export interface PaymentRefundResult {
  readonly paymentId: string;
  readonly amount: number;
  readonly currency: string;
}

export interface IPaymentRefundService {
  refund(request: PaymentRefundRequest): Promise<Result<PaymentRefundResult, ReturnRefundApplicationError>>;
}
