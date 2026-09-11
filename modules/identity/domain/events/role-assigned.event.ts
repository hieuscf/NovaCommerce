import type { DomainEvent } from '@novacommerce/building-blocks';

export class RoleAssignedEvent implements DomainEvent {
  readonly eventName = 'RoleAssigned';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: { roleId: string; roleName: string },
  ) {}
}
