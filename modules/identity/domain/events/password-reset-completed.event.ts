import type { DomainEvent } from '@novacommerce/building-blocks';

export class PasswordResetCompletedEvent implements DomainEvent {
  readonly eventName = 'PasswordResetCompleted';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: Record<string, never>,
  ) {}
}
