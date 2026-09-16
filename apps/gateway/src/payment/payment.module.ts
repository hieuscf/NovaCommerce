import { Module } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../../../modules/payment/contracts/tokens';
import { AddSavedPaymentMethodHandler } from '../../../../modules/payment/application/handlers/add-saved-payment-method.handler';
import { ConfirmPaymentHandler } from '../../../../modules/payment/application/handlers/confirm-payment.handler';
import { FailPaymentHandler } from '../../../../modules/payment/application/handlers/fail-payment.handler';
import { InitiatePaymentHandler } from '../../../../modules/payment/application/handlers/initiate-payment.handler';
import { ListSavedPaymentMethodsHandler } from '../../../../modules/payment/application/handlers/list-saved-payment-methods.handler';
import { RefundPaymentHandler } from '../../../../modules/payment/application/handlers/refund-payment.handler';
import { RemoveSavedPaymentMethodHandler } from '../../../../modules/payment/application/handlers/remove-saved-payment-method.handler';
import { SetDefaultSavedPaymentMethodHandler } from '../../../../modules/payment/application/handlers/set-default-saved-payment-method.handler';
import { PaymentInitiationService } from '../../../../modules/payment/application/services/payment-initiation.service';
import { PrismaOutboxStore } from '../../../../modules/payment/infrastructure/prisma/prisma-outbox-store';
import { StubCardTokenizer } from '../../../../modules/payment/infrastructure/providers/stub-card-tokenizer';
import { StubPaymentProvider } from '../../../../modules/payment/infrastructure/providers/stub-payment-provider';
import { PrismaPaymentRepository } from '../../../../modules/payment/infrastructure/repositories/prisma-payment-repository';
import { PrismaSavedPaymentMethodRepository } from '../../../../modules/payment/infrastructure/repositories/prisma-saved-payment-method-repository';
import { USER_TOKENS } from '../../../../modules/user/contracts/tokens';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { UserModule } from '../user/user.module';
import { PaymentsController } from './controllers/payments.controller';
import { SavedPaymentMethodsController } from './controllers/saved-payment-methods.controller';

@Module({
  imports: [UserModule],
  controllers: [PaymentsController, SavedPaymentMethodsController],
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
      provide: PAYMENT_TOKENS.CARD_TOKENIZER,
      useFactory: () => new StubCardTokenizer(),
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
      provide: PrismaSavedPaymentMethodRepository,
      useFactory: (prisma: PrismaService) => new PrismaSavedPaymentMethodRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: PAYMENT_TOKENS.SAVED_PAYMENT_METHOD_REPOSITORY,
      useExisting: PrismaSavedPaymentMethodRepository,
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
      provide: ListSavedPaymentMethodsHandler,
      useFactory: (userRepository, savedRepo: PrismaSavedPaymentMethodRepository) =>
        new ListSavedPaymentMethodsHandler(userRepository, savedRepo),
      inject: [USER_TOKENS.USER_REPOSITORY, PAYMENT_TOKENS.SAVED_PAYMENT_METHOD_REPOSITORY],
    },
    {
      provide: AddSavedPaymentMethodHandler,
      useFactory: (userRepository, savedRepo: PrismaSavedPaymentMethodRepository, tokenizer: StubCardTokenizer) =>
        new AddSavedPaymentMethodHandler(userRepository, savedRepo, tokenizer),
      inject: [
        USER_TOKENS.USER_REPOSITORY,
        PAYMENT_TOKENS.SAVED_PAYMENT_METHOD_REPOSITORY,
        PAYMENT_TOKENS.CARD_TOKENIZER,
      ],
    },
    {
      provide: RemoveSavedPaymentMethodHandler,
      useFactory: (userRepository, savedRepo: PrismaSavedPaymentMethodRepository) =>
        new RemoveSavedPaymentMethodHandler(userRepository, savedRepo),
      inject: [USER_TOKENS.USER_REPOSITORY, PAYMENT_TOKENS.SAVED_PAYMENT_METHOD_REPOSITORY],
    },
    {
      provide: SetDefaultSavedPaymentMethodHandler,
      useFactory: (userRepository, savedRepo: PrismaSavedPaymentMethodRepository) =>
        new SetDefaultSavedPaymentMethodHandler(userRepository, savedRepo),
      inject: [USER_TOKENS.USER_REPOSITORY, PAYMENT_TOKENS.SAVED_PAYMENT_METHOD_REPOSITORY],
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
