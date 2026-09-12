import type { Result } from '@novacommerce/building-blocks';
import type { ReturnRefundApplicationError } from '../errors/return-refund-application.error';

export interface OrderReturnValidationRequest {
  readonly orderId: string;
  readonly customerId: string;
}

export interface OrderReturnValidationResult {
  readonly orderId: string;
  readonly customerId: string;
  readonly paymentId: string;
  readonly refundAmount: number;
  readonly currency: string;
}

export interface IOrderReturnValidationService {
  validate(
    request: OrderReturnValidationRequest,
  ): Promise<Result<OrderReturnValidationResult, ReturnRefundApplicationError>>;
}
