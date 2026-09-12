import type { Order } from '../../domain/aggregates/order';
import type { OrderLine } from '../../domain/entities/order-line';
import type { OrderLineResponseDto, OrderListResponseDto, OrderResponseDto } from '../dto/order-response.dto';

export function mapOrderLineToDto(line: OrderLine): OrderLineResponseDto {
  const quantity = line.getQuantity().value;
  const unitPrice = line.getUnitPrice();

  return {
    id: line.id,
    productId: line.getProductId(),
    variantId: line.getVariantId(),
    quantity,
    unitPriceAmount: unitPrice.amount,
    unitPriceCurrency: unitPrice.currency,
    lineTotalAmount: unitPrice.amount * quantity,
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt.toISOString(),
  };
}

export function mapOrderToDto(order: Order): OrderResponseDto {
  const lines = order.getLines().map(mapOrderLineToDto);
  const total = order.getTotal();

  return {
    id: order.id,
    orderNumber: order.getOrderNumber().value,
    customerId: order.getCustomerId(),
    status: order.getStatus(),
    totalAmount: total.amount,
    totalCurrency: total.currency,
    lines,
    lineCount: lines.length,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function mapOrderListToDto(
  orders: readonly Order[],
  total: number,
  page: number,
  pageSize: number,
): OrderListResponseDto {
  return {
    items: orders.map(mapOrderToDto),
    total,
    page,
    pageSize,
  };
}
