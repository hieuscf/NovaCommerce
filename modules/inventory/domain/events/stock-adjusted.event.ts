import type { DomainEvent } from '@novacommerce/building-blocks';

export interface StockAdjustedPayload { readonly delta: number; readonly reason: string }

export class StockAdjustedEvent implements DomainEvent {
  readonly eventName = 'StockAdjusted';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: StockAdjustedPayload,
  ) {}
}
