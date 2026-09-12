import { BaseEntity } from '@novacommerce/building-blocks';
import type { Quantity } from '../value-objects/quantity';
import type { ReservationId } from '../value-objects/reservation-id';

export enum ReservationStatus { ACTIVE = 'active', RELEASED = 'released', FULFILLED = 'fulfilled' }

export class StockReservation extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private reservationId: ReservationId, private orderId: string,
    private quantity: Quantity, private status: ReservationStatus,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, reservationId: ReservationId, orderId: string, quantity: Quantity): StockReservation {
    return new StockReservation(id, new Date(), new Date(), reservationId, orderId, quantity, ReservationStatus.ACTIVE);
  }

  static reconstitute(props: {
    id: string;
    reservationId: ReservationId;
    orderId: string;
    quantity: Quantity;
    status: ReservationStatus;
    createdAt: Date;
    updatedAt: Date;
  }): StockReservation {
    return new StockReservation(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.reservationId,
      props.orderId,
      props.quantity,
      props.status,
    );
  }

  release(): void { this.status = ReservationStatus.RELEASED; this.updatedAt = new Date(); }
  getReservationId(): ReservationId { return this.reservationId; }
  getOrderId(): string { return this.orderId; }
  getQuantity(): Quantity { return this.quantity; }
  getStatus(): ReservationStatus { return this.status; }
}
