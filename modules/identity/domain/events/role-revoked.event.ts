import type { DomainEvent } from '@novacommerce/building-blocks';

export class RoleRevokedEvent implements DomainEvent {
  readonly eventName = 'RoleRevoked';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: { roleId: string; roleName: string },
  ) {}
}
