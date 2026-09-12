import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type {
  IPaymentInitiationService,
  PaymentInitiationRequest,
  PaymentInitiationResult,
} from '../../application/contracts/payment-initiation.contract';
import { PaymentApplicationError } from '../../application/errors/payment-application.error';

function resolveRedirectBaseUrl(provider: PaymentInitiationRequest['provider']): string | undefined {
  const envKey = `${provider.toUpperCase()}_REDIRECT_BASE_URL`;
  return process.env[envKey]?.trim() || undefined;
}

/**
 * Stub payment initiation — returns a provider redirect URL from environment configuration.
 * Real VNPAY/MOMO/PayPal SDK integration belongs in the Payment module infrastructure.
 */
export class StubPaymentInitiationService implements IPaymentInitiationService {
  async initiate(
    request: PaymentInitiationRequest,
  ): Promise<Result<PaymentInitiationResult, PaymentApplicationError>> {
    const redirectBaseUrl = resolveRedirectBaseUrl(request.provider);
    if (!redirectBaseUrl) {
      return Result.fail(
        new PaymentApplicationError(
          `Payment provider ${request.provider} is not configured`,
          'PAYMENT_PROVIDER_NOT_CONFIGURED',
        ),
      );
    }

    const paymentId = randomUUID();
    const redirectUrl = new URL(redirectBaseUrl);
    redirectUrl.searchParams.set('orderId', request.orderId);
    redirectUrl.searchParams.set('amount', String(request.amount));
    redirectUrl.searchParams.set('currency', request.currency);
    redirectUrl.searchParams.set('paymentId', paymentId);

    return Result.ok({
      paymentId,
      provider: request.provider,
      redirectUrl: redirectUrl.toString(),
    });
  }
}
