export interface OutboxMessage {
  readonly id: string;
  readonly eventName: string;
  readonly payload: unknown;
  readonly occurredOn: Date;
}

export interface IOutboxStore {
  save(messages: readonly OutboxMessage[]): Promise<void>;
}
