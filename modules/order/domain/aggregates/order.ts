import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { OrderDomainError } from '../errors/order-domain.error';
import { OrderAddress } from '../entities/order-address';
import { OrderAdjustment } from '../entities/order-adjustment';
import { OrderLine } from '../entities/order-line';
import { OrderPaymentReference } from '../entities/order-payment-reference';
import { OrderShipmentReference } from '../entities/order-shipment-reference';
import { OrderCancelledEvent } from '../events/order-cancelled.event';
import { OrderCompletedEvent } from '../events/order-completed.event';
import { OrderConfirmedEvent } from '../events/order-confirmed.event';
import { OrderCreatedEvent } from '../events/order-created.event';
import type { Money } from '../value-objects/money';
import type { OrderId } from '../value-objects/order-id';
import type { OrderNumber } from '../value-objects/order-number';

export enum OrderStatus { PENDING = 'pending', CONFIRMED = 'confirmed', CANCELLED = 'cancelled', COMPLETED = 'completed' }

export class Order extends AggregateRoot<string> {
  private lines: OrderLine[] = [];
  private adjustments: OrderAdjustment[] = [];
  private addresses: OrderAddress[] = [];
  private paymentReferences: OrderPaymentReference[] = [];
  private shipmentReferences: OrderShipmentReference[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private orderNumber: OrderNumber, private customerId: string,
    private status: OrderStatus, private total: Money,
  ) { super(id, createdAt, updatedAt); }

  static create(id: OrderId, orderNumber: OrderNumber, customerId: string, total: Money): Result<Order, OrderDomainError> {
    if (!customerId?.trim()) {
      return Result.fail(new OrderDomainError('Customer id is required', 'INVALID_CUSTOMER_ID'));
    }
    const now = new Date();
    const order = new Order(id.value, now, now, orderNumber, customerId.trim(), OrderStatus.PENDING, total);
    order.addDomainEvent(new OrderCreatedEvent(id.value, now, { orderNumber: orderNumber.value, customerId: customerId.trim() }));
    return Result.ok(order);
  }

  static reconstitute(props: {
    id: string; orderNumber: OrderNumber; customerId: string; status: OrderStatus; total: Money;
    createdAt: Date; updatedAt: Date;
    lines: OrderLine[]; adjustments: OrderAdjustment[]; addresses: OrderAddress[];
    paymentReferences: OrderPaymentReference[]; shipmentReferences: OrderShipmentReference[];
  }): Order {
    const order = new Order(props.id, props.createdAt, props.updatedAt, props.orderNumber, props.customerId, props.status, props.total);
    order.lines = [...props.lines];
    order.adjustments = [...props.adjustments];
    order.addresses = [...props.addresses];
    order.paymentReferences = [...props.paymentReferences];
    order.shipmentReferences = [...props.shipmentReferences];
    return order;
  }

  private ensureModifiable(): Result<void, OrderDomainError> {
    if (this.status === OrderStatus.COMPLETED || this.status === OrderStatus.CANCELLED) {
      return Result.fail(new OrderDomainError('Order cannot be modified', 'ORDER_NOT_MODIFIABLE'));
    }
    return Result.ok(undefined);
  }

  addLine(line: OrderLine): Result<void, OrderDomainError> {
    const check = this.ensureModifiable();
    if (check.isFailure) return check;
    this.lines.push(line);
    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  confirm(): Result<void, OrderDomainError> {
    const check = this.ensureModifiable();
    if (check.isFailure) return check;
    if (this.lines.length === 0) {
      return Result.fail(new OrderDomainError('Order must have lines before confirm', 'ORDER_NO_LINES'));
    }
    this.status = OrderStatus.CONFIRMED;
    this.updatedAt = new Date();
    this.addDomainEvent(new OrderConfirmedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  cancel(): Result<void, OrderDomainError> {
    if (this.status === OrderStatus.COMPLETED) {
      return Result.fail(new OrderDomainError('Completed order cannot be cancelled', 'ORDER_COMPLETED'));
    }
    if (this.status === OrderStatus.CANCELLED) {
      return Result.fail(new OrderDomainError('Order is already cancelled', 'ORDER_ALREADY_CANCELLED'));
    }
    this.status = OrderStatus.CANCELLED;
    this.updatedAt = new Date();
    this.addDomainEvent(new OrderCancelledEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  complete(): Result<void, OrderDomainError> {
    if (this.status !== OrderStatus.CONFIRMED) {
      return Result.fail(new OrderDomainError('Only confirmed orders can be completed', 'ORDER_NOT_CONFIRMED'));
    }
    this.status = OrderStatus.COMPLETED;
    this.updatedAt = new Date();
    this.addDomainEvent(new OrderCompletedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  getOrderNumber(): OrderNumber { return this.orderNumber; }
  getStatus(): OrderStatus { return this.status; }
  getTotal(): Money { return this.total; }
  getLines(): readonly OrderLine[] { return this.lines; }
  getCustomerId(): string { return this.customerId; }
}
