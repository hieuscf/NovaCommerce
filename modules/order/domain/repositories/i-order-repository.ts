import type { Order, OrderStatus } from '../aggregates/order';
import type { OrderId } from '../value-objects/order-id';
import type { OrderNumber } from '../value-objects/order-number';

export interface OrderListParams {
  readonly status?: OrderStatus;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface OrderListResult {
  readonly items: Order[];
  readonly total: number;
}

export interface IOrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByOrderNumber(orderNumber: OrderNumber): Promise<Order | null>;
  listByCustomerId(customerId: string, params?: OrderListParams): Promise<OrderListResult>;
  save(order: Order): Promise<void>;
}
