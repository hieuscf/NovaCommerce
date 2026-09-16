/**
 * Gateway Order DTOs for customer history (`GET /users/me/orders`).
 * Field names match `modules/order/application/dto/order-response.dto.ts`.
 */

export type ApiOrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface OrderLineDto {
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

export interface OrderDto {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly status: string;
  readonly totalAmount: number;
  readonly totalCurrency: string;
  readonly lines: readonly OrderLineDto[];
  readonly lineCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OrderListDto {
  readonly items: readonly OrderDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface OrderHistoryQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly status?: ApiOrderStatus;
}

export interface IOrderClient {
  getOrderHistory(query?: OrderHistoryQuery): Promise<OrderListDto>;
  getOrderById(orderId: string): Promise<OrderDto>;
}
