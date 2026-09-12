import { Result } from '@novacommerce/building-blocks';
import type {
  IPaymentInitiationService,
  PaymentInitiationRequest,
  PaymentInitiationResult,
} from '../contracts/payment-initiation.contract';
import type { PaymentApplicationError } from '../errors/payment-application.error';
import { InitiatePaymentHandler } from '../handlers/initiate-payment.handler';

export class PaymentInitiationService implements IPaymentInitiationService {
  constructor(private readonly initiatePaymentHandler: InitiatePaymentHandler) {}

  async initiate(
    request: PaymentInitiationRequest,
  ): Promise<Result<PaymentInitiationResult, PaymentApplicationError>> {
    const result = await this.initiatePaymentHandler.execute({
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      provider: request.provider,
      customerId: request.customerId,
    });

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const value = result.getValue();
    return Result.ok({
      paymentId: value.id,
      provider: request.provider,
      redirectUrl: value.redirectUrl,
    });
  }
}
