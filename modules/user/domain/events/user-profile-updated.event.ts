import type { DomainEvent } from '@novacommerce/building-blocks';

export interface UserProfileUpdatedPayload {
  readonly displayName?: string;
  readonly phoneNumber?: string | null;
  readonly avatarUrl?: string | null;
}

export class UserProfileUpdatedEvent implements DomainEvent {
  readonly eventName = 'UserProfileUpdated';

  constructor(
    readonly aggregateId: string,
    readonly occurredOn: Date,
    readonly payload: UserProfileUpdatedPayload,
  ) {}
}
