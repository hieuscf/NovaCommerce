import { Module } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../../../modules/payment/contracts/tokens';
import { ConfirmPaymentHandler } from '../../../../modules/payment/application/handlers/confirm-payment.handler';
import { FailPaymentHandler } from '../../../../modules/payment/application/handlers/fail-payment.handler';
import { InitiatePaymentHandler } from '../../../../modules/payment/application/handlers/initiate-payment.handler';
import { RefundPaymentHandler } from '../../../../modules/payment/application/handlers/refund-payment.handler';
import { PaymentInitiationService } from '../../../../modules/payment/application/services/payment-initiation.service';
import { PrismaOutboxStore } from '../../../../modules/payment/infrastructure/prisma/prisma-outbox-store';
import { StubPaymentProvider } from '../../../../modules/payment/infrastructure/providers/stub-payment-provider';
import { PrismaPaymentRepository } from '../../../../modules/payment/infrastructure/repositories/prisma-payment-repository';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENT_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: PAYMENT_TOKENS.PAYMENT_PROVIDER,
      useFactory: () => new StubPaymentProvider(),
    },
    {
      provide: PrismaPaymentRepository,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaPaymentRepository(prisma, outboxStore),
      inject: [PrismaService, PAYMENT_TOKENS.OUTBOX_STORE],
    },
    {
      provide: PAYMENT_TOKENS.PAYMENT_REPOSITORY,
      useExisting: PrismaPaymentRepository,
    },
    {
      provide: InitiatePaymentHandler,
      useFactory: (repository: PrismaPaymentRepository, paymentProvider: StubPaymentProvider) =>
        new InitiatePaymentHandler(repository, paymentProvider),
      inject: [PAYMENT_TOKENS.PAYMENT_REPOSITORY, PAYMENT_TOKENS.PAYMENT_PROVIDER],
    },
    {
      provide: ConfirmPaymentHandler,
      useFactory: (repository: PrismaPaymentRepository) => new ConfirmPaymentHandler(repository),
      inject: [PAYMENT_TOKENS.PAYMENT_REPOSITORY],
    },
    {
      provide: FailPaymentHandler,
      useFactory: (repository: PrismaPaymentRepository) => new FailPaymentHandler(repository),
      inject: [PAYMENT_TOKENS.PAYMENT_REPOSITORY],
    },
    {
      provide: RefundPaymentHandler,
      useFactory: (repository: PrismaPaymentRepository) => new RefundPaymentHandler(repository),
      inject: [PAYMENT_TOKENS.PAYMENT_REPOSITORY],
    },
    {
      provide: PaymentInitiationService,
      useFactory: (initiatePaymentHandler: InitiatePaymentHandler) =>
        new PaymentInitiationService(initiatePaymentHandler),
      inject: [InitiatePaymentHandler],
    },
    {
      provide: PAYMENT_TOKENS.PAYMENT_INITIATION_SERVICE,
      useExisting: PaymentInitiationService,
    },
  ],
  exports: [
    PAYMENT_TOKENS.PAYMENT_INITIATION_SERVICE,
    PAYMENT_TOKENS.PAYMENT_REPOSITORY,
    RefundPaymentHandler,
  ],
})
export class PaymentModule {}
