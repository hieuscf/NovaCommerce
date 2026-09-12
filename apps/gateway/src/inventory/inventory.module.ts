import { Inject, Module, OnModuleInit } from '@nestjs/common';
import type { DomainEvent, IEventBus } from '@novacommerce/building-blocks';
import { INVENTORY_TOKENS } from '../../../../modules/inventory/contracts/tokens';
import { EVENT_BUS } from '../infrastructure/events/event-bus.module';
import { AdjustStockHandler } from '../../../../modules/inventory/application/handlers/adjust-stock.handler';
import { CreateInventoryItemHandler } from '../../../../modules/inventory/application/handlers/create-inventory-item.handler';
import { OrderCreatedHandler } from '../../../../modules/inventory/application/handlers/order-created.handler';
import { ReleaseStockByOrderHandler } from '../../../../modules/inventory/application/handlers/release-stock-by-order.handler';
import { ReleaseStockHandler } from '../../../../modules/inventory/application/handlers/release-stock.handler';
import { ReserveStockHandler } from '../../../../modules/inventory/application/handlers/reserve-stock.handler';
import { PrismaOutboxStore } from '../../../../modules/inventory/infrastructure/prisma/prisma-outbox-store';
import { PrismaInventoryItemRepository } from '../../../../modules/inventory/infrastructure/repositories/prisma-inventory-item-repository';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { InventoryController } from './controllers/inventory.controller';

@Module({
  controllers: [InventoryController],
  providers: [
    {
      provide: INVENTORY_TOKENS.EVENT_BUS,
      useExisting: EVENT_BUS,
    },
    {
      provide: INVENTORY_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaInventoryItemRepository(prisma, outboxStore),
      inject: [PrismaService, INVENTORY_TOKENS.OUTBOX_STORE],
    },
    {
      provide: CreateInventoryItemHandler,
      useFactory: (repository: PrismaInventoryItemRepository) => new CreateInventoryItemHandler(repository),
      inject: [INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY],
    },
    {
      provide: AdjustStockHandler,
      useFactory: (repository: PrismaInventoryItemRepository) => new AdjustStockHandler(repository),
      inject: [INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY],
    },
    {
      provide: ReserveStockHandler,
      useFactory: (repository: PrismaInventoryItemRepository) => new ReserveStockHandler(repository),
      inject: [INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY],
    },
    {
      provide: ReleaseStockHandler,
      useFactory: (repository: PrismaInventoryItemRepository) => new ReleaseStockHandler(repository),
      inject: [INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY],
    },
    {
      provide: ReleaseStockByOrderHandler,
      useFactory: (repository: PrismaInventoryItemRepository) =>
        new ReleaseStockByOrderHandler(repository),
      inject: [INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY],
    },
    {
      provide: OrderCreatedHandler,
      useFactory: (reserveStockHandler: ReserveStockHandler) => new OrderCreatedHandler(reserveStockHandler),
      inject: [ReserveStockHandler],
    },
  ],
  exports: [INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY],
})
export class InventoryModule implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    private readonly orderCreatedHandler: OrderCreatedHandler,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe('OrderCreated', async (event) => {
      await this.orderCreatedHandler.handle(event as DomainEvent);
    });
  }
}
