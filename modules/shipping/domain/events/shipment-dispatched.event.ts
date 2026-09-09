import type { DomainEvent } from '@novacommerce/building-blocks';

export type ShipmentDispatchedPayload = Record<string, never>;

export class ShipmentDispatchedEvent implements DomainEvent {
  readonly eventName = 'ShipmentDispatched';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ShipmentDispatchedPayload,
  ) {}
}
