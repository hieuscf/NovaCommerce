import type { Result } from '@novacommerce/building-blocks';
import type { PaymentApplicationError } from '../errors/payment-application.error';
import type { PaymentProvider } from './payment-provider.contract';

export interface PaymentInitiationRequest {
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly provider: PaymentProvider;
  readonly customerId: string;
}

export interface PaymentInitiationResult {
  readonly paymentId: string;
  readonly provider: PaymentProvider;
  readonly redirectUrl: string;
}

export interface IPaymentInitiationService {
  initiate(
    request: PaymentInitiationRequest,
  ): Promise<Result<PaymentInitiationResult, PaymentApplicationError>>;
}
