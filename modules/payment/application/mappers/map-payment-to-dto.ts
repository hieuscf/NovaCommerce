import type { Payment } from '../../domain/aggregates/payment';
import type { PaymentInitiationResponseDto, PaymentResponseDto } from '../dto/payment-response.dto';

export function mapPaymentToDto(payment: Payment): PaymentResponseDto {
  return {
    id: payment.id,
    reference: payment.getReference().value,
    orderId: payment.getOrderId(),
    amount: payment.getAmount().amount,
    currency: payment.getAmount().currency,
    method: payment.getMethod().value,
    status: payment.getStatus(),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

export function mapPaymentInitiationToDto(
  payment: Payment,
  provider: string,
  redirectUrl: string,
): PaymentInitiationResponseDto {
  return {
    ...mapPaymentToDto(payment),
    provider,
    redirectUrl,
  };
}
