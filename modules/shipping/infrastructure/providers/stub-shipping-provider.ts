import { Result } from '@novacommerce/building-blocks';
import type {
  IShippingProvider,
  ShippingQuoteRequest,
  ShippingQuoteResponse,
} from '../../application/contracts/i-shipping-provider';
import { ShippingApplicationError } from '../../application/errors/shipping-application.error';
import { Money } from '../../domain/value-objects/money';

const DEFAULT_RATES: Record<string, { baseAmount: number; perItemAmount: number; estimatedDays: number }> = {
  standard: { baseAmount: 5, perItemAmount: 1, estimatedDays: 5 },
  express: { baseAmount: 12, perItemAmount: 2, estimatedDays: 2 },
};

function resolveRate(methodCode: string) {
  const envKey = `SHIPPING_RATE_${methodCode.toUpperCase()}`;
  const configured = process.env[envKey]?.trim();
  if (configured) {
    const [baseAmount, perItemAmount, estimatedDays] = configured.split(',').map((part) => Number(part.trim()));
    if (
      Number.isFinite(baseAmount) &&
      Number.isFinite(perItemAmount) &&
      Number.isFinite(estimatedDays) &&
      baseAmount >= 0 &&
      perItemAmount >= 0 &&
      estimatedDays > 0
    ) {
      return { baseAmount, perItemAmount, estimatedDays };
    }
  }
  return DEFAULT_RATES[methodCode.toLowerCase()];
}

/**
 * Stub shipping provider — flat base rate plus per-item surcharge per method code.
 * Real carrier integrations belong in dedicated infrastructure providers.
 */
export class StubShippingProvider implements IShippingProvider {
  async calculateQuote(
    request: ShippingQuoteRequest,
  ): Promise<Result<ShippingQuoteResponse, ShippingApplicationError>> {
    const rate = resolveRate(request.methodCode);
    if (!rate) {
      return Result.fail(
        new ShippingApplicationError(`Shipping method ${request.methodCode} is not supported`, 'SHIPPING_METHOD_NOT_SUPPORTED'),
      );
    }

    const amount = rate.baseAmount + rate.perItemAmount * request.itemCount;
    const money = Money.create(amount, request.currency);

    return Result.ok({
      methodCode: request.methodCode,
      amount: money.amount,
      currency: money.currency,
      estimatedDays: rate.estimatedDays,
    });
  }
}
