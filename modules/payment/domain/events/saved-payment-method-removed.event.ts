import type { DomainEvent } from '@novacommerce/building-blocks';

export interface SavedPaymentMethodRemovedPayload {
  readonly customerId: string;
}

export class SavedPaymentMethodRemovedEvent implements DomainEvent {
  readonly eventName = 'SavedPaymentMethodRemoved';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: SavedPaymentMethodRemovedPayload,
  ) {}
}
