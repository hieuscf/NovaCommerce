import { describe, expect, it } from 'vitest';
import { CheckoutSession, CheckoutStatus } from './checkout-session';
import { CheckoutLine } from '../entities/checkout-line';

describe('CheckoutSession', () => {
  it('starts checkout and emits CheckoutStarted', () => {
    const result = CheckoutSession.start('session-1', 'cart-1', 'customer-1');
    expect(result.isSuccess).toBe(true);

    const session = result.getValue();
    expect(session.getStatus()).toBe(CheckoutStatus.STARTED);
    expect(session.getCartId()).toBe('cart-1');
    expect(session.getCustomerId()).toBe('customer-1');

    const events = session.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventName).toBe('CheckoutStarted');
  });

  it('completes checkout when lines exist', () => {
    const session = CheckoutSession.start('session-1', 'cart-1', 'customer-1').getValue();
    session.addLine(CheckoutLine.create('line-1', 'product-1', 2, 10, 'USD'));

    const completeResult = session.complete('order-1');
    expect(completeResult.isSuccess).toBe(true);
    expect(session.getStatus()).toBe(CheckoutStatus.COMPLETED);

    const events = session.pullDomainEvents();
    expect(events.some((event) => event.eventName === 'CheckoutCompleted')).toBe(true);
  });

  it('rejects completion without lines', () => {
    const session = CheckoutSession.start('session-1', 'cart-1', 'customer-1').getValue();
    const completeResult = session.complete('order-1');
    expect(completeResult.isFailure).toBe(true);
    expect(completeResult.getError().code).toBe('CHECKOUT_NO_LINES');
  });
});
