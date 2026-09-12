import { Module } from '@nestjs/common';
import { PROMOTION_TOKENS } from '../../../../modules/promotion/contracts/tokens';
import { CalculateDiscountHandler } from '../../../../modules/promotion/application/handlers/calculate-discount.handler';
import { UseCouponHandler } from '../../../../modules/promotion/application/handlers/use-coupon.handler';
import { ValidateCouponHandler } from '../../../../modules/promotion/application/handlers/validate-coupon.handler';
import { EvaluatePromotionService } from '../../../../modules/promotion/application/services/evaluate-promotion.service';
import { PromotionContextService } from '../../../../modules/promotion/application/services/promotion-context.service';
import { PrismaOutboxStore } from '../../../../modules/promotion/infrastructure/prisma/prisma-outbox-store';
import { PrismaCouponRepository } from '../../../../modules/promotion/infrastructure/repositories/prisma-coupon-repository';
import { PrismaPromotionRepository } from '../../../../modules/promotion/infrastructure/repositories/prisma-promotion-repository';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { PromotionsController } from './controllers/promotions.controller';

@Module({
  controllers: [PromotionsController],
  providers: [
    {
      provide: PROMOTION_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: PrismaCouponRepository,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaCouponRepository(prisma, outboxStore),
      inject: [PrismaService, PROMOTION_TOKENS.OUTBOX_STORE],
    },
    {
      provide: PrismaPromotionRepository,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaPromotionRepository(prisma, outboxStore),
      inject: [PrismaService, PROMOTION_TOKENS.OUTBOX_STORE],
    },
    {
      provide: PROMOTION_TOKENS.COUPON_REPOSITORY,
      useExisting: PrismaCouponRepository,
    },
    {
      provide: PROMOTION_TOKENS.PROMOTION_REPOSITORY,
      useExisting: PrismaPromotionRepository,
    },
    {
      provide: PromotionContextService,
      useFactory: (couponRepository: PrismaCouponRepository, promotionRepository: PrismaPromotionRepository) =>
        new PromotionContextService(couponRepository, promotionRepository),
      inject: [PROMOTION_TOKENS.COUPON_REPOSITORY, PROMOTION_TOKENS.PROMOTION_REPOSITORY],
    },
    {
      provide: ValidateCouponHandler,
      useFactory: (promotionContextService: PromotionContextService) =>
        new ValidateCouponHandler(promotionContextService),
      inject: [PromotionContextService],
    },
    {
      provide: CalculateDiscountHandler,
      useFactory: (promotionContextService: PromotionContextService) =>
        new CalculateDiscountHandler(promotionContextService),
      inject: [PromotionContextService],
    },
    {
      provide: UseCouponHandler,
      useFactory: (couponRepository: PrismaCouponRepository) => new UseCouponHandler(couponRepository),
      inject: [PROMOTION_TOKENS.COUPON_REPOSITORY],
    },
    {
      provide: EvaluatePromotionService,
      useFactory: (calculateDiscountHandler: CalculateDiscountHandler) =>
        new EvaluatePromotionService(calculateDiscountHandler),
      inject: [CalculateDiscountHandler],
    },
    {
      provide: PROMOTION_TOKENS.PROMOTION_EVALUATION_SERVICE,
      useExisting: EvaluatePromotionService,
    },
  ],
  exports: [
    PROMOTION_TOKENS.COUPON_REPOSITORY,
    PROMOTION_TOKENS.PROMOTION_REPOSITORY,
    PROMOTION_TOKENS.PROMOTION_EVALUATION_SERVICE,
    UseCouponHandler,
  ],
})
export class PromotionModule {}
