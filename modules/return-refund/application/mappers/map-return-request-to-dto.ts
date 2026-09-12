import type { ReturnRequest } from '../../domain/aggregates/return-request';
import type { ReturnRequestResponseDto } from '../dto/return-response.dto';

export function mapReturnRequestToDto(returnRequest: ReturnRequest): ReturnRequestResponseDto {
  const refundAmount = returnRequest.getRefundAmount();
  return {
    id: returnRequest.id,
    orderId: returnRequest.getOrderId(),
    customerId: returnRequest.getCustomerId(),
    paymentId: returnRequest.getPaymentId(),
    status: returnRequest.getStatus().value,
    refundAmount: refundAmount.amount,
    currency: refundAmount.currency,
    createdAt: returnRequest.createdAt.toISOString(),
    updatedAt: returnRequest.updatedAt.toISOString(),
  };
}
