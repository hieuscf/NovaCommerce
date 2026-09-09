import type { DomainEvent } from '@novacommerce/building-blocks';

export interface ShipmentCreatedPayload { readonly orderId: string; readonly carrierCode: string }

export class ShipmentCreatedEvent implements DomainEvent {
  readonly eventName = 'ShipmentCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ShipmentCreatedPayload,
  ) {}
}
