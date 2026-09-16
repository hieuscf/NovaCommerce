/**
 * Gateway Cart DTOs for authenticated customer cart (`/users/me/cart`).
 * Field names match `modules/cart/application/dto/cart-response.dto.ts`.
 */

export interface CartItemDto {
  readonly id: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
  readonly lineTotalAmount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CartDto {
  readonly id: string;
  readonly customerId?: string;
  readonly items: readonly CartItemDto[];
  readonly itemCount: number;
  readonly subtotalAmount: number;
  readonly currency?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AddCartItemRequest {
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
}

export interface UpdateCartItemQuantityRequest {
  readonly quantity: number;
}

export interface ICartClient {
  getCart(): Promise<CartDto>;
  addItem(body: AddCartItemRequest): Promise<CartDto>;
  updateItemQuantity(itemId: string, body: UpdateCartItemQuantityRequest): Promise<CartDto>;
  removeItem(itemId: string): Promise<CartDto>;
  clearCart(): Promise<CartDto>;
}
