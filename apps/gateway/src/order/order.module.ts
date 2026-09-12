import { Module } from '@nestjs/common';
import { CancelOrderHandler } from '../../../../modules/order/application/handlers/cancel-order.handler';
import { CreateOrderFromCheckoutHandler } from '../../../../modules/order/application/handlers/create-order-from-checkout.handler';
import { GetOrderByIdHandler } from '../../../../modules/order/application/handlers/get-order-by-id.handler';
import { GetOrderHistoryHandler } from '../../../../modules/order/application/handlers/get-order-history.handler';
import { ORDER_TOKENS } from '../../../../modules/order/contracts/tokens';
import { PrismaOutboxStore } from '../../../../modules/order/infrastructure/prisma/prisma-outbox-store';
import { PrismaOrderRepository } from '../../../../modules/order/infrastructure/repositories/prisma-order-repository';
import { USER_TOKENS } from '../../../../modules/user/contracts/tokens';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { OrdersController } from './controllers/orders.controller';

@Module({
  imports: [UserModule],
  controllers: [OrdersController],
  providers: [
    {
      provide: ORDER_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: PrismaOrderRepository,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaOrderRepository(prisma, outboxStore),
      inject: [PrismaService, ORDER_TOKENS.OUTBOX_STORE],
    },
    {
      provide: ORDER_TOKENS.ORDER_REPOSITORY,
      useExisting: PrismaOrderRepository,
    },
    {
      provide: CreateOrderFromCheckoutHandler,
      useFactory: (orderRepository: PrismaOrderRepository) => new CreateOrderFromCheckoutHandler(orderRepository),
      inject: [ORDER_TOKENS.ORDER_REPOSITORY],
    },
    {
      provide: ORDER_TOKENS.CREATE_ORDER_FROM_CHECKOUT,
      useExisting: CreateOrderFromCheckoutHandler,
    },
    {
      provide: GetOrderByIdHandler,
      useFactory: (userRepository, orderRepository) => new GetOrderByIdHandler(userRepository, orderRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, ORDER_TOKENS.ORDER_REPOSITORY],
    },
    {
      provide: GetOrderHistoryHandler,
      useFactory: (userRepository, orderRepository) => new GetOrderHistoryHandler(userRepository, orderRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, ORDER_TOKENS.ORDER_REPOSITORY],
    },
    {
      provide: CancelOrderHandler,
      useFactory: (userRepository, orderRepository) => new CancelOrderHandler(userRepository, orderRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, ORDER_TOKENS.ORDER_REPOSITORY],
    },
  ],
  exports: [ORDER_TOKENS.ORDER_REPOSITORY, ORDER_TOKENS.CREATE_ORDER_FROM_CHECKOUT],
})
export class OrderModule {}
