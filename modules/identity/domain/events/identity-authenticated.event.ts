import type { DomainEvent } from '@novacommerce/building-blocks';

export interface IdentityAuthenticatedPayload { readonly method: string }

export class IdentityAuthenticatedEvent implements DomainEvent {
  readonly eventName = 'IdentityAuthenticated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: IdentityAuthenticatedPayload,
  ) {}
}
