import type { DomainEvent } from '@novacommerce/building-blocks';

export type ShipmentDeliveredPayload = Record<string, never>;

export class ShipmentDeliveredEvent implements DomainEvent {
  readonly eventName = 'ShipmentDelivered';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: ShipmentDeliveredPayload,
  ) {}
}
