import type { DomainEvent } from '../events/domain-event';
import type { IntegrationEvent } from '../events/integration-event';

export type BusEvent = DomainEvent | IntegrationEvent;

export function isIntegrationEvent(event: BusEvent): event is IntegrationEvent {
  return 'eventType' in event && 'eventVersion' in event && 'eventId' in event;
}

export function getBusEventType(event: BusEvent): string {
  if (isIntegrationEvent(event)) {
    return event.eventType;
  }

  return event.eventName;
}
