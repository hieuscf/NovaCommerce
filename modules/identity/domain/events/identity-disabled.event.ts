import type { DomainEvent } from '@novacommerce/building-blocks';

export type IdentityDisabledPayload = Record<string, never>;

export class IdentityDisabledEvent implements DomainEvent {
  readonly eventName = 'IdentityDisabled';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: IdentityDisabledPayload,
  ) {}
}
