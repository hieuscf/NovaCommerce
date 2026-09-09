import type { DomainEvent } from '@novacommerce/building-blocks';

export interface StockReservedPayload { readonly orderId: string; readonly quantity: number }

export class StockReservedEvent implements DomainEvent {
  readonly eventName = 'StockReserved';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: StockReservedPayload,
  ) {}
}
