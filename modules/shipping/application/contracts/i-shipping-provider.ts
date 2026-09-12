import type { Result } from '@novacommerce/building-blocks';
import type { ShippingApplicationError } from '../errors/shipping-application.error';

export interface ShippingQuoteRequest {
  readonly methodCode: string;
  readonly destinationCountry: string;
  readonly itemCount: number;
  readonly currency: string;
}

export interface ShippingQuoteResponse {
  readonly methodCode: string;
  readonly amount: number;
  readonly currency: string;
  readonly estimatedDays: number;
}

export interface IShippingProvider {
  calculateQuote(
    request: ShippingQuoteRequest,
  ): Promise<Result<ShippingQuoteResponse, ShippingApplicationError>>;
}
