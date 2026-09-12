import { Global, Module } from '@nestjs/common';
import { InMemoryEventBus } from '@novacommerce/building-blocks';

export const EVENT_BUS = Symbol('IEventBus');

@Global()
@Module({
  providers: [
    {
      provide: EVENT_BUS,
      useFactory: () => new InMemoryEventBus(),
    },
  ],
  exports: [EVENT_BUS],
})
export class EventBusModule {}
