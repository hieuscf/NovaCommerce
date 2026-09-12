import { Module } from '@nestjs/common';
import { SHIPPING_TOKENS } from '../../../../modules/shipping/contracts/tokens';
import { CalculateShippingHandler } from '../../../../modules/shipping/application/handlers/calculate-shipping.handler';
import { CreateShipmentHandler } from '../../../../modules/shipping/application/handlers/create-shipment.handler';
import { DispatchShipmentHandler } from '../../../../modules/shipping/application/handlers/dispatch-shipment.handler';
import { TrackShipmentHandler } from '../../../../modules/shipping/application/handlers/track-shipment.handler';
import { PrismaOutboxStore } from '../../../../modules/shipping/infrastructure/prisma/prisma-outbox-store';
import { StubShippingProvider } from '../../../../modules/shipping/infrastructure/providers/stub-shipping-provider';
import { PrismaShipmentRepository } from '../../../../modules/shipping/infrastructure/repositories/prisma-shipment-repository';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { ShipmentsController } from './controllers/shipments.controller';

@Module({
  controllers: [ShipmentsController],
  providers: [
    {
      provide: SHIPPING_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: SHIPPING_TOKENS.SHIPPING_PROVIDER,
      useFactory: () => new StubShippingProvider(),
    },
    {
      provide: PrismaShipmentRepository,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaShipmentRepository(prisma, outboxStore),
      inject: [PrismaService, SHIPPING_TOKENS.OUTBOX_STORE],
    },
    {
      provide: SHIPPING_TOKENS.SHIPMENT_REPOSITORY,
      useExisting: PrismaShipmentRepository,
    },
    {
      provide: CalculateShippingHandler,
      useFactory: (shippingProvider: StubShippingProvider) => new CalculateShippingHandler(shippingProvider),
      inject: [SHIPPING_TOKENS.SHIPPING_PROVIDER],
    },
    {
      provide: CreateShipmentHandler,
      useFactory: (repository: PrismaShipmentRepository) => new CreateShipmentHandler(repository),
      inject: [SHIPPING_TOKENS.SHIPMENT_REPOSITORY],
    },
    {
      provide: TrackShipmentHandler,
      useFactory: (repository: PrismaShipmentRepository) => new TrackShipmentHandler(repository),
      inject: [SHIPPING_TOKENS.SHIPMENT_REPOSITORY],
    },
    {
      provide: DispatchShipmentHandler,
      useFactory: (repository: PrismaShipmentRepository) => new DispatchShipmentHandler(repository),
      inject: [SHIPPING_TOKENS.SHIPMENT_REPOSITORY],
    },
  ],
  exports: [SHIPPING_TOKENS.SHIPMENT_REPOSITORY],
})
export class ShippingModule {}
