import type { IntegrationEvent, IntegrationEventMetadata } from './integration-event';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIntegrationEventMetadata(value: unknown): value is IntegrationEventMetadata {
  if (!isRecord(value)) {
    return false;
  }

  const { correlationId, causationId, requestId } = value;

  return (
    (correlationId === undefined || typeof correlationId === 'string') &&
    (causationId === undefined || typeof causationId === 'string') &&
    (requestId === undefined || typeof requestId === 'string')
  );
}

export function serializeIntegrationEvent(event: IntegrationEvent): string {
  return JSON.stringify(event);
}

export function parseIntegrationEvent(data: unknown): IntegrationEvent | null {
  if (!isRecord(data)) {
    return null;
  }

  const {
    eventId,
    eventType,
    eventVersion,
    aggregateId,
    aggregateType,
    occurredAt,
    payload,
    metadata,
  } = data;

  if (
    typeof eventId !== 'string' ||
    typeof eventType !== 'string' ||
    typeof eventVersion !== 'number' ||
    typeof aggregateId !== 'string' ||
    typeof aggregateType !== 'string' ||
    typeof occurredAt !== 'string' ||
    !isRecord(payload)
  ) {
    return null;
  }

  if (metadata !== undefined && !isIntegrationEventMetadata(metadata)) {
    return null;
  }

  return {
    eventId,
    eventType,
    eventVersion,
    aggregateId,
    aggregateType,
    occurredAt,
    payload,
    metadata,
  };
}

export function parseIntegrationEventJson(json: string): IntegrationEvent | null {
  try {
    return parseIntegrationEvent(JSON.parse(json) as unknown);
  } catch {
    return null;
  }
}
