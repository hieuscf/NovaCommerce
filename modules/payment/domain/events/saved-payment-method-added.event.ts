import type { DomainEvent } from '@novacommerce/building-blocks';

export interface SavedPaymentMethodAddedPayload {
  readonly customerId: string;
  readonly brand: string;
  readonly last4: string;
}

export class SavedPaymentMethodAddedEvent implements DomainEvent {
  readonly eventName = 'SavedPaymentMethodAdded';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: SavedPaymentMethodAddedPayload,
  ) {}
}
