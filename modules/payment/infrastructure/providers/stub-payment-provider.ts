import { Result } from '@novacommerce/building-blocks';
import type {
  IPaymentProvider,
  PaymentProviderIntentRequest,
  PaymentProviderIntentResponse,
} from '../../application/contracts/i-payment-provider';
import { PaymentApplicationError } from '../../application/errors/payment-application.error';

function resolveRedirectBaseUrl(provider: PaymentProviderIntentRequest['provider']): string | undefined {
  const envKey = `${provider.toUpperCase()}_REDIRECT_BASE_URL`;
  return process.env[envKey]?.trim() || undefined;
}

/**
 * Stub payment provider — returns a redirect URL from environment configuration.
 * Real VNPAY/MOMO/PayPal SDK integration belongs in dedicated infrastructure providers.
 */
export class StubPaymentProvider implements IPaymentProvider {
  async createIntent(
    request: PaymentProviderIntentRequest,
  ): Promise<Result<PaymentProviderIntentResponse, PaymentApplicationError>> {
    const redirectBaseUrl = resolveRedirectBaseUrl(request.provider);
    if (!redirectBaseUrl) {
      return Result.fail(
        new PaymentApplicationError(
          `Payment provider ${request.provider} is not configured`,
          'PAYMENT_PROVIDER_NOT_CONFIGURED',
        ),
      );
    }

    const redirectUrl = new URL(redirectBaseUrl);
    redirectUrl.searchParams.set('orderId', request.orderId);
    redirectUrl.searchParams.set('amount', String(request.amount));
    redirectUrl.searchParams.set('currency', request.currency);
    redirectUrl.searchParams.set('paymentId', request.paymentId);

    return Result.ok({ redirectUrl: redirectUrl.toString() });
  }
}
