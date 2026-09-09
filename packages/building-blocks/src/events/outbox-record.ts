/**
 * Outbox row shape aligned with `outbox_messages` table.
 * Used by Outbox Publisher — not a domain entity.
 */

export interface OutboxRecord {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventType: string;
  readonly payload: unknown;
  readonly createdAt: Date;
  readonly processedAt: Date | null;
  readonly retryCount: number;
  readonly lastError: string | null;
}
