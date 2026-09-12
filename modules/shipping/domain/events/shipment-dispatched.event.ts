import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ShipmentDispatchedPayload {
  readonly trackingNumber: string;
}

export class ShipmentDispatchedEvent implements DomainEvent {
  readonly eventName = 'ShipmentDispatched';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ShipmentDispatchedPayload,
  ) {}
}
