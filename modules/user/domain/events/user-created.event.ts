import type { DomainEvent } from '@novacommerce/building-blocks';

export interface UserCreatedPayload { readonly identityId: string }

export class UserCreatedEvent implements DomainEvent {
  readonly eventName = 'UserCreated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: UserCreatedPayload,
  ) {}
}
