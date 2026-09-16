import type { DomainEvent } from '@novacommerce/building-blocks';

export interface SavedPaymentMethodDefaultChangedPayload {
  readonly customerId: string;
  readonly isDefault: boolean;
}

export class SavedPaymentMethodDefaultChangedEvent implements DomainEvent {
  readonly eventName = 'SavedPaymentMethodDefaultChanged';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: SavedPaymentMethodDefaultChangedPayload,
  ) {}
}
