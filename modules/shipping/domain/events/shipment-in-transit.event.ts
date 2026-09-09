import type { DomainEvent } from '@novacommerce/building-blocks';

export type ShipmentInTransitPayload = Record<string, never>;

export class ShipmentInTransitEvent implements DomainEvent {
  readonly eventName = 'ShipmentInTransit';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ShipmentInTransitPayload,
  ) {}
}
