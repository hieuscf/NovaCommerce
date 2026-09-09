import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { CheckoutDomainError } from '../errors/checkout-domain.error';
import { CheckoutAdjustment } from '../entities/checkout-adjustment';
import { CheckoutLine } from '../entities/checkout-line';
import { CheckoutCompletedEvent } from '../events/checkout-completed.event';
import { CheckoutStartedEvent } from '../events/checkout-started.event';

export enum CheckoutStatus { STARTED = 'started', COMPLETED = 'completed', ABANDONED = 'abandoned' }

export class CheckoutSession extends AggregateRoot<string> {
  private lines: CheckoutLine[] = [];
  private adjustments: CheckoutAdjustment[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private cartId: string, private customerId: string | undefined, private status: CheckoutStatus,
  ) { super(id, createdAt, updatedAt); }

  static start(id: string, cartId: string, customerId?: string): Result<CheckoutSession, CheckoutDomainError> {
    if (!cartId?.trim()) {
      return Result.fail(new CheckoutDomainError('Cart id is required', 'INVALID_CART_ID'));
    }
    const now = new Date();
    const session = new CheckoutSession(id, now, now, cartId.trim(), customerId, CheckoutStatus.STARTED);
    session.addDomainEvent(new CheckoutStartedEvent(id, now, { cartId: cartId.trim(), customerId }));
    return Result.ok(session);
  }

  static reconstitute(props: {
    id: string; cartId: string; customerId?: string; status: CheckoutStatus;
    createdAt: Date; updatedAt: Date; lines: CheckoutLine[]; adjustments: CheckoutAdjustment[];
  }): CheckoutSession {
    const session = new CheckoutSession(props.id, props.createdAt, props.updatedAt, props.cartId, props.customerId, props.status);
    session.lines = [...props.lines];
    session.adjustments = [...props.adjustments];
    return session;
  }

  addLine(line: CheckoutLine): void { this.lines.push(line); this.updatedAt = new Date(); }
  addAdjustment(adjustment: CheckoutAdjustment): void { this.adjustments.push(adjustment); this.updatedAt = new Date(); }

  complete(orderId: string): Result<void, CheckoutDomainError> {
    if (this.status === CheckoutStatus.COMPLETED) {
      return Result.fail(new CheckoutDomainError('Checkout already completed', 'CHECKOUT_ALREADY_COMPLETED'));
    }
    if (this.lines.length === 0) {
      return Result.fail(new CheckoutDomainError('Checkout must have lines', 'CHECKOUT_NO_LINES'));
    }
    if (!orderId?.trim()) {
      return Result.fail(new CheckoutDomainError('Order id is required', 'INVALID_ORDER_ID'));
    }
    this.status = CheckoutStatus.COMPLETED;
    this.updatedAt = new Date();
    this.addDomainEvent(new CheckoutCompletedEvent(this.id, new Date(), { orderId: orderId.trim() }));
    return Result.ok(undefined);
  }

  getStatus(): CheckoutStatus { return this.status; }
  getLines(): readonly CheckoutLine[] { return this.lines; }
  getAdjustments(): readonly CheckoutAdjustment[] { return this.adjustments; }
  getCartId(): string { return this.cartId; }
}
