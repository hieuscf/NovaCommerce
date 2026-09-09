import type { BusEvent } from './bus-event';
import { getBusEventType } from './bus-event';
import type { EventHandlerFn, IEventHandler } from './event-handler';
import type { IEventBus } from './event-bus';

type RegisteredHandler = IEventHandler | EventHandlerFn;

function isEventHandlerFn(handler: RegisteredHandler): handler is EventHandlerFn {
  return typeof handler === 'function';
}

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, RegisteredHandler[]>();

  subscribe<TEvent extends BusEvent = BusEvent>(
    eventType: string,
    handler: IEventHandler<TEvent> | EventHandlerFn<TEvent>,
  ): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as RegisteredHandler);
    this.handlers.set(eventType, existing);
  }

  async publish(event: BusEvent): Promise<void> {
    const eventType = getBusEventType(event);
    const handlers = this.handlers.get(eventType) ?? [];

    for (const handler of handlers) {
      if (isEventHandlerFn(handler)) {
        await handler(event);
      } else {
        await handler.handle(event);
      }
    }
  }

  async publishAll(events: readonly BusEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
