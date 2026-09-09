import type { Order } from '../aggregates/order';
import type { OrderId } from '../value-objects/order-id';
import type { OrderNumber } from '../value-objects/order-number';

export interface IOrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByOrderNumber(orderNumber: OrderNumber): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
