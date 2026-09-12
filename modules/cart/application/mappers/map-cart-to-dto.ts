import type { Cart } from '../../domain/aggregates/cart';
import type { CartItemResponseDto, CartResponseDto } from '../dto/cart-response.dto';

export function mapCartItemToDto(item: ReturnType<Cart['getItems']>[number]): CartItemResponseDto {
  const quantity = item.getQuantity().value;
  const unitPrice = item.getUnitPrice();

  return {
    id: item.id,
    productId: item.getProductReference().productId,
    variantId: item.getProductReference().variantId,
    quantity,
    unitPriceAmount: unitPrice.amount,
    unitPriceCurrency: unitPrice.currency,
    lineTotalAmount: unitPrice.amount * quantity,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function mapCartToDto(cart: Cart): CartResponseDto {
  const items = cart.getItems().map(mapCartItemToDto);
  const currency = items[0]?.unitPriceCurrency;
  const subtotalAmount = items.reduce((total, item) => total + item.lineTotalAmount, 0);

  return {
    id: cart.id,
    customerId: cart.getCustomerId(),
    items,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    subtotalAmount,
    currency,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}
