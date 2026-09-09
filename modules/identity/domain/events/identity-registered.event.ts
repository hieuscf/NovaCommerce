import type { DomainEvent } from '@novacommerce/building-blocks';

export interface IdentityRegisteredPayload { readonly email: string }

export class IdentityRegisteredEvent implements DomainEvent {
  readonly eventName = 'IdentityRegistered';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: IdentityRegisteredPayload,
  ) {}
}
