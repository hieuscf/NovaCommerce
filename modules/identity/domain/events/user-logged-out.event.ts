import type { DomainEvent } from '@novacommerce/building-blocks';

export class UserLoggedOutEvent implements DomainEvent {
  readonly eventName = 'UserLoggedOut';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: { sessionId: string },
  ) {}
}
