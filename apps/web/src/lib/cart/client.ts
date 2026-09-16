import { getApiClient } from '@/lib/api/client';
import type {
  AddCartItemRequest,
  CartDto,
  ICartClient,
  UpdateCartItemQuantityRequest,
} from './types';

function createGatewayCartClient(): ICartClient {
  return {
    getCart(): Promise<CartDto> {
      return getApiClient().get<CartDto>('/users/me/cart');
    },

    addItem(body: AddCartItemRequest): Promise<CartDto> {
      return getApiClient().post<CartDto>('/users/me/cart/items', body);
    },

    updateItemQuantity(itemId: string, body: UpdateCartItemQuantityRequest): Promise<CartDto> {
      return getApiClient().patch<CartDto>(
        `/users/me/cart/items/${encodeURIComponent(itemId)}`,
        body,
      );
    },

    removeItem(itemId: string): Promise<CartDto> {
      return getApiClient().delete<CartDto>(
        `/users/me/cart/items/${encodeURIComponent(itemId)}`,
      );
    },

    clearCart(): Promise<CartDto> {
      return getApiClient().delete<CartDto>('/users/me/cart');
    },
  };
}

export function createCartClient(): ICartClient {
  return createGatewayCartClient();
}

export const cartClient: ICartClient = createCartClient();
