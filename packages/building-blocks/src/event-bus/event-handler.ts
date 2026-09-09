import type { BusEvent } from './bus-event';

export interface IEventHandler<TEvent extends BusEvent = BusEvent> {
  handle(event: TEvent): Promise<void>;
}

export type EventHandlerFn<TEvent extends BusEvent = BusEvent> = (
  event: TEvent,
) => Promise<void>;
