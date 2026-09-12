import { describe, expect, it, vi } from 'vitest';
import { Order } from '../../../../../modules/order/domain/aggregates/order';
import { OrderLine } from '../../../../../modules/order/domain/entities/order-line';
import { Money } from '../../../../../modules/order/domain/value-objects/money';
import { Quantity } from '../../../../../modules/order/domain/value-objects/quantity';
import { OrderId } from '../../../../../modules/order/domain/value-objects/order-id';
import { OrderNumber } from '../../../../../modules/order/domain/value-objects/order-number';
import { Payment, PaymentStatus } from '../../../../../modules/payment/domain/aggregates/payment';
import { PaymentMethod } from '../../../../../modules/payment/domain/value-objects/payment-method';
import { PaymentReference } from '../../../../../modules/payment/domain/value-objects/payment-reference';
import { OrderReturnValidationAdapter } from './order-return-validation.adapter';

describe('OrderReturnValidationAdapter', () => {
  it('validates completed order with succeeded payment', async () => {
    const order = Order.create(
      OrderId.create('22222222-2222-2222-2222-222222222222'),
      OrderNumber.create('ORD-001'),
      '33333333-3333-3333-3333-333333333333',
      Money.create(100, 'USD'),
    ).getValue();
    order.addLine(
      OrderLine.create(
        '55555555-5555-5555-5555-555555555555',
        '66666666-6666-6666-6666-666666666666',
        Quantity.create(1),
        Money.create(100, 'USD'),
      ),
    );
    order.confirm();
    order.complete();

    const payment = Payment.reconstitute({
      id: '44444444-4444-4444-4444-444444444444',
      reference: PaymentReference.create('PAY-001'),
      orderId: order.id,
      amount: Money.create(100, 'USD'),
      method: PaymentMethod.create('card'),
      status: PaymentStatus.SUCCEEDED,
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: [],
      transactions: [],
    });

    const adapter = new OrderReturnValidationAdapter(
      { findById: vi.fn().mockResolvedValue(order) },
      { findByOrderId: vi.fn().mockResolvedValue(payment) },
    );

    const result = await adapter.validate({
      orderId: order.id,
      customerId: '33333333-3333-3333-3333-333333333333',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().paymentId).toBe(payment.id);
    expect(result.getValue().refundAmount).toBe(100);
  });
});
