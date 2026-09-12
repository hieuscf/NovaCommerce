import { describe, expect, it } from 'vitest';
import { OrderLine } from '../entities/order-line';
import { OrderCancelledEvent } from '../events/order-cancelled.event';
import { OrderCompletedEvent } from '../events/order-completed.event';
import { OrderConfirmedEvent } from '../events/order-confirmed.event';
import { OrderCreatedEvent } from '../events/order-created.event';
import { Money } from '../value-objects/money';
import { OrderId } from '../value-objects/order-id';
import { OrderNumber } from '../value-objects/order-number';
import { Quantity } from '../value-objects/quantity';
import { Order, OrderStatus } from './order';

describe('Order aggregate', () => {
  const orderId = OrderId.create('11111111-1111-1111-1111-111111111111');
  const orderNumber = OrderNumber.create('ORD-TEST001');
  const customerId = '22222222-2222-2222-2222-222222222222';
  const total = Money.create(99.99, 'USD');

  function createLine(id = '33333333-3333-3333-3333-333333333333') {
    return OrderLine.create(id, '44444444-4444-4444-4444-444444444444', Quantity.create(2), Money.create(49.99, 'USD'));
  }

  it('creates order with pending status and OrderCreated event', () => {
    const result = Order.create(orderId, orderNumber, customerId, total);
    expect(result.isSuccess).toBe(true);

    const order = result.getValue();
    expect(order.getStatus()).toBe(OrderStatus.PENDING);
    expect(order.getCustomerId()).toBe(customerId);
    expect(order.getTotal().amount).toBe(99.99);

    const events = order.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrderCreatedEvent);
    expect((events[0] as OrderCreatedEvent).payload.orderNumber).toBe('ORD-TEST001');
  });

  it('creates order from checkout with lines and extended OrderCreated payload', () => {
    const result = Order.createFromCheckout({
      id: orderId,
      orderNumber,
      customerId,
      total,
      lines: [
        {
          lineId: '55555555-5555-5555-5555-555555555555',
          productId: '44444444-4444-4444-4444-444444444444',
          quantity: Quantity.create(1),
          unitPrice: Money.create(99.99, 'USD'),
          sku: 'NOVA-HP-001',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
    const order = result.getValue();
    expect(order.getLines()).toHaveLength(1);

    const events = order.pullDomainEvents();
    const created = events.find((event) => event instanceof OrderCreatedEvent) as OrderCreatedEvent;
    expect(created.payload.lines).toEqual([
      { sku: 'NOVA-HP-001', quantity: 1, warehouseId: '66666666-6666-6666-6666-666666666666' },
    ]);
  });

  it('fails checkout creation without lines', () => {
    const result = Order.createFromCheckout({
      id: orderId,
      orderNumber,
      customerId,
      total,
      lines: [],
    });
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ORDER_NO_LINES');
  });

  it('confirms order with lines and emits OrderConfirmed', () => {
    const order = Order.createFromCheckout({
      id: orderId,
      orderNumber,
      customerId,
      total,
      lines: [
        {
          lineId: '55555555-5555-5555-5555-555555555555',
          productId: '44444444-4444-4444-4444-444444444444',
          quantity: Quantity.create(1),
          unitPrice: Money.create(99.99, 'USD'),
          sku: 'NOVA-HP-001',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    }).getValue();
    order.pullDomainEvents();

    const confirmResult = order.confirm();
    expect(confirmResult.isSuccess).toBe(true);
    expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);

    const events = order.pullDomainEvents();
    expect(events.some((event) => event instanceof OrderConfirmedEvent)).toBe(true);
  });

  it('fails to confirm order without lines', () => {
    const order = Order.create(orderId, orderNumber, customerId, total).getValue();
    order.pullDomainEvents();

    const result = order.confirm();
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ORDER_NO_LINES');
  });

  it('cancels pending order and emits OrderCancelled', () => {
    const order = Order.createFromCheckout({
      id: orderId,
      orderNumber,
      customerId,
      total,
      lines: [
        {
          lineId: '55555555-5555-5555-5555-555555555555',
          productId: '44444444-4444-4444-4444-444444444444',
          quantity: Quantity.create(1),
          unitPrice: Money.create(99.99, 'USD'),
          sku: 'NOVA-HP-001',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    }).getValue();
    order.pullDomainEvents();

    const result = order.cancel();
    expect(result.isSuccess).toBe(true);
    expect(order.getStatus()).toBe(OrderStatus.CANCELLED);

    const events = order.pullDomainEvents();
    expect(events.some((event) => event instanceof OrderCancelledEvent)).toBe(true);
  });

  it('fails to cancel completed order', () => {
    const order = Order.createFromCheckout({
      id: orderId,
      orderNumber,
      customerId,
      total,
      lines: [
        {
          lineId: '55555555-5555-5555-5555-555555555555',
          productId: '44444444-4444-4444-4444-444444444444',
          quantity: Quantity.create(1),
          unitPrice: Money.create(99.99, 'USD'),
          sku: 'NOVA-HP-001',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    }).getValue();
    order.pullDomainEvents();
    order.confirm();
    order.complete();
    order.pullDomainEvents();

    const result = order.cancel();
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ORDER_COMPLETED');
  });

  it('completes confirmed order and emits OrderCompleted', () => {
    const order = Order.createFromCheckout({
      id: orderId,
      orderNumber,
      customerId,
      total,
      lines: [
        {
          lineId: '55555555-5555-5555-5555-555555555555',
          productId: '44444444-4444-4444-4444-444444444444',
          quantity: Quantity.create(1),
          unitPrice: Money.create(99.99, 'USD'),
          sku: 'NOVA-HP-001',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    }).getValue();
    order.pullDomainEvents();
    order.confirm();
    order.pullDomainEvents();

    const result = order.complete();
    expect(result.isSuccess).toBe(true);
    expect(order.getStatus()).toBe(OrderStatus.COMPLETED);

    const events = order.pullDomainEvents();
    expect(events.some((event) => event instanceof OrderCompletedEvent)).toBe(true);
  });

  it('fails to complete non-confirmed order', () => {
    const order = Order.create(orderId, orderNumber, customerId, total).getValue();
    order.pullDomainEvents();

    const result = order.complete();
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ORDER_NOT_CONFIRMED');
  });

  it('prevents modifying terminal orders', () => {
    const order = Order.createFromCheckout({
      id: orderId,
      orderNumber,
      customerId,
      total,
      lines: [
        {
          lineId: '55555555-5555-5555-5555-555555555555',
          productId: '44444444-4444-4444-4444-444444444444',
          quantity: Quantity.create(1),
          unitPrice: Money.create(99.99, 'USD'),
          sku: 'NOVA-HP-001',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    }).getValue();
    order.pullDomainEvents();
    order.cancel();
    order.pullDomainEvents();

    const result = order.addLine(createLine());
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ORDER_NOT_MODIFIABLE');
  });
});
