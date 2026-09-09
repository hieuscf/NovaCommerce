import { DomainEvent } from '../events/domain-event';

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: readonly DomainEvent[]): Promise<void>;
}
