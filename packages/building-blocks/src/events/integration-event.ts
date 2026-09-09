/**
 * Cross-context integration event contract.
 * Serializable envelope for outbox persistence and EventBus publication.
 * At-least-once delivery — consumers must be idempotent.
 */

export interface IntegrationEventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly requestId?: string;
}

export interface IntegrationEvent<TPayload = Record<string, unknown>> {
  readonly eventId: string;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly occurredAt: string;
  readonly payload: TPayload;
  readonly metadata?: IntegrationEventMetadata;
}

export type IntegrationEventPayload = Record<string, unknown>;
