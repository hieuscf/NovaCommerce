import type { Result } from '@novacommerce/building-blocks';
import type { PaymentApplicationError } from '../errors/payment-application.error';
import type { PaymentProvider } from './payment-provider.contract';

export interface PaymentProviderIntentRequest {
  readonly paymentId: string;
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly provider: PaymentProvider;
  readonly customerId: string;
}

export interface PaymentProviderIntentResponse {
  readonly redirectUrl: string;
}

export interface IPaymentProvider {
  createIntent(
    request: PaymentProviderIntentRequest,
  ): Promise<Result<PaymentProviderIntentResponse, PaymentApplicationError>>;
}
