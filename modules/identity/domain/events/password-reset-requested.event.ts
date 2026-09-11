import type { DomainEvent } from '@novacommerce/building-blocks';

export class PasswordResetRequestedEvent implements DomainEvent {
  readonly eventName = 'PasswordResetRequested';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: { email: string },
  ) {}
}
