import type { DomainEvent } from '@novacommerce/building-blocks';

export class RefreshTokenRotatedEvent implements DomainEvent {
  readonly eventName = 'RefreshTokenRotated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: { sessionId: string; replacedBySessionId: string },
  ) {}
}
