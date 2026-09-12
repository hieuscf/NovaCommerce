import { Result } from '@novacommerce/building-blocks';
import type { RefundPaymentHandler } from '../../../../../modules/payment/application/handlers/refund-payment.handler';
import type {
  IPaymentRefundService,
  PaymentRefundRequest,
  PaymentRefundResult,
} from '../../../../../modules/return-refund/application/contracts/i-payment-refund.contract';
import { ReturnRefundApplicationError } from '../../../../../modules/return-refund/application/errors/return-refund-application.error';

export class PaymentRefundAdapter implements IPaymentRefundService {
  constructor(private readonly refundPaymentHandler: RefundPaymentHandler) {}

  async refund(
    request: PaymentRefundRequest,
  ): Promise<Result<PaymentRefundResult, ReturnRefundApplicationError>> {
    const result = await this.refundPaymentHandler.execute({
      paymentId: request.paymentId,
      amount: request.amount,
    });

    if (result.isFailure) {
      return Result.fail(new ReturnRefundApplicationError(result.getError().message, result.getError().code));
    }

    const payment = result.getValue();
    return Result.ok({
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    });
  }
}
