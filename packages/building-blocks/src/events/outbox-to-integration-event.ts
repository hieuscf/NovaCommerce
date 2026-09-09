import type { IntegrationEvent } from './integration-event';
import type { OutboxRecord } from './outbox-record';
import {
  isP0DomainEventName,
  isP0IntegrationEventType,
  P0_EVENT_VERSION,
  toIntegrationEventType,
} from './event-type-registry';
import { validateP0EventPayload } from './p0-events';

export class OutboxEventParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutboxEventParseError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildIntegrationEventFromOutbox(
  record: OutboxRecord,
): IntegrationEvent {
  const integrationEventType = toIntegrationEventType(record.eventType);
  const eventVersion = P0_EVENT_VERSION;

  if (!isRecord(record.payload)) {
    throw new OutboxEventParseError(
      `Outbox message ${record.id} has non-object payload`,
    );
  }

  if (
    isP0DomainEventName(record.eventType) &&
    isP0IntegrationEventType(integrationEventType) &&
    !validateP0EventPayload(integrationEventType, record.payload)
  ) {
    throw new OutboxEventParseError(
      `Outbox message ${record.id} payload does not match P0 schema for ${integrationEventType}`,
    );
  }

  return {
    eventId: record.id,
    eventType: integrationEventType,
    eventVersion,
    aggregateId: record.aggregateId,
    aggregateType: record.aggregateType,
    occurredAt: record.createdAt.toISOString(),
    payload: record.payload,
  };
}
