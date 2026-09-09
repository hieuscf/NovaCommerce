import type { BusEvent } from './bus-event';
import type { EventHandlerFn, IEventHandler } from './event-handler';

export interface IEventBus {
  publish(event: BusEvent): Promise<void>;
  publishAll(events: readonly BusEvent[]): Promise<void>;
  subscribe<TEvent extends BusEvent = BusEvent>(
    eventType: string,
    handler: IEventHandler<TEvent> | EventHandlerFn<TEvent>,
  ): void;
}
