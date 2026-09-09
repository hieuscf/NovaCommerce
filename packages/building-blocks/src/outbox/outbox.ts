import type { OutboxRecord } from '../events/outbox-record';

export interface OutboxMessage {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventType: string;
  readonly payload: unknown;
  readonly occurredOn: Date;
}

export interface IOutboxStore {
  save(messages: readonly OutboxMessage[]): Promise<void>;
}

export interface IOutboxRepository {
  findUnprocessed(limit: number): Promise<readonly OutboxRecord[]>;
  markProcessed(id: string): Promise<void>;
  recordFailure(id: string, error: string): Promise<void>;
}
