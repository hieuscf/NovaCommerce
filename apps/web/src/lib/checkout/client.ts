import { getApiClient } from '@/lib/api/client';
import type {
  CheckoutSessionDto,
  CompleteCheckoutDto,
  CompleteCheckoutRequest,
  ICheckoutClient,
  StartCheckoutRequest,
} from './types';

function createGatewayCheckoutClient(): ICheckoutClient {
  return {
    startCheckout(body: StartCheckoutRequest): Promise<CheckoutSessionDto> {
      return getApiClient().post<CheckoutSessionDto>('/users/me/checkout', body);
    },

    completeCheckout(sessionId: string, body: CompleteCheckoutRequest): Promise<CompleteCheckoutDto> {
      return getApiClient().post<CompleteCheckoutDto>(
        `/users/me/checkout/${encodeURIComponent(sessionId)}/complete`,
        body,
      );
    },
  };
}

export function createCheckoutClient(): ICheckoutClient {
  return createGatewayCheckoutClient();
}

export const checkoutClient: ICheckoutClient = createCheckoutClient();
