import type { DomainEvent } from '@novacommerce/building-blocks';

export interface StockReservationReleasedPayload { readonly reservationId: string }

export class StockReservationReleasedEvent implements DomainEvent {
  readonly eventName = 'StockReservationReleased';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: StockReservationReleasedPayload,
  ) {}
}
