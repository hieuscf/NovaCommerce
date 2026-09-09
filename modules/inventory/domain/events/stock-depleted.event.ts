import type { DomainEvent } from '@novacommerce/building-blocks';

export type StockDepletedPayload = Record<string, never>;

export class StockDepletedEvent implements DomainEvent {
  readonly eventName = 'StockDepleted';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: StockDepletedPayload,
  ) {}
}
