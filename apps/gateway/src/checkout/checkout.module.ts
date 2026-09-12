import { Module } from '@nestjs/common';
import { CART_TOKENS } from '../../../../modules/cart/contracts/tokens';
import { CATALOG_TOKENS } from '../../../../modules/catalog/contracts/tokens';
import { CHECKOUT_TOKENS } from '../../../../modules/checkout/contracts/tokens';
import { CompleteCheckoutHandler } from '../../../../modules/checkout/application/handlers/complete-checkout.handler';
import { StartCheckoutHandler } from '../../../../modules/checkout/application/handlers/start-checkout.handler';
import { PrismaOutboxStore as CheckoutPrismaOutboxStore } from '../../../../modules/checkout/infrastructure/prisma/prisma-outbox-store';
import { PrismaCheckoutSessionRepository } from '../../../../modules/checkout/infrastructure/repositories/prisma-checkout-session-repository';
import { INVENTORY_TOKENS } from '../../../../modules/inventory/contracts/tokens';
import { ORDER_TOKENS } from '../../../../modules/order/contracts/tokens';
import { CreateOrderFromCheckoutHandler } from '../../../../modules/order/application/handlers/create-order-from-checkout.handler';
import { PrismaOutboxStore as OrderPrismaOutboxStore } from '../../../../modules/order/infrastructure/prisma/prisma-outbox-store';
import { PrismaOrderRepository } from '../../../../modules/order/infrastructure/repositories/prisma-order-repository';
import { PAYMENT_TOKENS } from '../../../../modules/payment/contracts/tokens';
import { StubPaymentInitiationService } from '../../../../modules/payment/infrastructure/services/stub-payment-initiation.service';
import { PROMOTION_TOKENS } from '../../../../modules/promotion/contracts/tokens';
import { EvaluatePromotionService } from '../../../../modules/promotion/application/services/evaluate-promotion.service';
import { PrismaCouponRepository } from '../../../../modules/promotion/infrastructure/repositories/prisma-coupon-repository';
import { PrismaPromotionRepository } from '../../../../modules/promotion/infrastructure/repositories/prisma-promotion-repository';
import { USER_TOKENS } from '../../../../modules/user/contracts/tokens';
import { CartModule } from '../cart/cart.module';
import { CatalogModule } from '../catalog/catalog.module';
import { InventoryModule } from '../inventory/inventory.module';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { CheckoutController } from './controllers/checkout.controller';

@Module({
  imports: [UserModule, CartModule, CatalogModule, InventoryModule],
  controllers: [CheckoutController],
  providers: [
    {
      provide: CHECKOUT_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new CheckoutPrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: PrismaCheckoutSessionRepository,
      useFactory: (prisma: PrismaService, outboxStore: CheckoutPrismaOutboxStore) =>
        new PrismaCheckoutSessionRepository(prisma, outboxStore),
      inject: [PrismaService, CHECKOUT_TOKENS.OUTBOX_STORE],
    },
    {
      provide: CHECKOUT_TOKENS.CHECKOUT_SESSION_REPOSITORY,
      useExisting: PrismaCheckoutSessionRepository,
    },
    {
      provide: ORDER_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new OrderPrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: PrismaOrderRepository,
      useFactory: (prisma: PrismaService, outboxStore: OrderPrismaOutboxStore) =>
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
      provide: PROMOTION_TOKENS.COUPON_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaCouponRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: PROMOTION_TOKENS.PROMOTION_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaPromotionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: EvaluatePromotionService,
      useFactory: (couponRepository: PrismaCouponRepository, promotionRepository: PrismaPromotionRepository) =>
        new EvaluatePromotionService(couponRepository, promotionRepository),
      inject: [PROMOTION_TOKENS.COUPON_REPOSITORY, PROMOTION_TOKENS.PROMOTION_REPOSITORY],
    },
    {
      provide: PROMOTION_TOKENS.PROMOTION_EVALUATION_SERVICE,
      useExisting: EvaluatePromotionService,
    },
    {
      provide: StubPaymentInitiationService,
      useFactory: () => new StubPaymentInitiationService(),
    },
    {
      provide: PAYMENT_TOKENS.PAYMENT_INITIATION_SERVICE,
      useExisting: StubPaymentInitiationService,
    },
    {
      provide: StartCheckoutHandler,
      useFactory: (
        userRepository,
        cartRepository,
        productRepository,
        inventoryRepository,
        promotionEvaluationService,
        checkoutSessionRepository,
      ) =>
        new StartCheckoutHandler(
          userRepository,
          cartRepository,
          productRepository,
          inventoryRepository,
          promotionEvaluationService,
          checkoutSessionRepository,
        ),
      inject: [
        USER_TOKENS.USER_REPOSITORY,
        CART_TOKENS.CART_REPOSITORY,
        CATALOG_TOKENS.PRODUCT_REPOSITORY,
        INVENTORY_TOKENS.INVENTORY_ITEM_REPOSITORY,
        PROMOTION_TOKENS.PROMOTION_EVALUATION_SERVICE,
        CHECKOUT_TOKENS.CHECKOUT_SESSION_REPOSITORY,
      ],
    },
    {
      provide: CompleteCheckoutHandler,
      useFactory: (
        userRepository,
        productRepository,
        checkoutSessionRepository,
        createOrderFromCheckoutService,
        paymentInitiationService,
      ) =>
        new CompleteCheckoutHandler(
          userRepository,
          productRepository,
          checkoutSessionRepository,
          createOrderFromCheckoutService,
          paymentInitiationService,
        ),
      inject: [
        USER_TOKENS.USER_REPOSITORY,
        CATALOG_TOKENS.PRODUCT_REPOSITORY,
        CHECKOUT_TOKENS.CHECKOUT_SESSION_REPOSITORY,
        ORDER_TOKENS.CREATE_ORDER_FROM_CHECKOUT,
        PAYMENT_TOKENS.PAYMENT_INITIATION_SERVICE,
      ],
    },
  ],
})
export class CheckoutModule {}
