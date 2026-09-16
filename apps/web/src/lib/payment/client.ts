import { getApiClient } from '@/lib/api/client';
import type {
  AddSavedPaymentMethodRequest,
  IPaymentMethodsClient,
  SavedPaymentMethodDto,
} from './types';

function createGatewayPaymentMethodsClient(): IPaymentMethodsClient {
  return {
    list(): Promise<SavedPaymentMethodDto[]> {
      return getApiClient().get<SavedPaymentMethodDto[]>('/users/me/payment-methods');
    },

    add(body: AddSavedPaymentMethodRequest): Promise<SavedPaymentMethodDto> {
      return getApiClient().post<SavedPaymentMethodDto>('/users/me/payment-methods', body);
    },

    remove(paymentMethodId: string): Promise<void> {
      return getApiClient().delete<void>(
        `/users/me/payment-methods/${encodeURIComponent(paymentMethodId)}`,
      );
    },

    setDefault(paymentMethodId: string): Promise<SavedPaymentMethodDto> {
      return getApiClient().post<SavedPaymentMethodDto>(
        `/users/me/payment-methods/${encodeURIComponent(paymentMethodId)}/default`,
      );
    },
  };
}

export function createPaymentMethodsClient(): IPaymentMethodsClient {
  return createGatewayPaymentMethodsClient();
}

export const paymentMethodsClient: IPaymentMethodsClient = createPaymentMethodsClient();
