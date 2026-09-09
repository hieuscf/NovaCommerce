import { BaseEntity } from '../entity/base-entity';
import { DomainEvent } from '../events/domain-event';

export abstract class AggregateRoot<TId> extends BaseEntity<TId> {
  private readonly domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
