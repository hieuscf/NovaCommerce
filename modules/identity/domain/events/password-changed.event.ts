import type { DomainEvent } from '@novacommerce/building-blocks';

export class PasswordChangedEvent implements DomainEvent {
  readonly eventName = 'PasswordChanged';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: Record<string, never>,
  ) {}
}
