import { Module } from '@nestjs/common';
import { ORDER_TOKENS } from '../../../../modules/order/contracts/tokens';
import { PAYMENT_TOKENS } from '../../../../modules/payment/contracts/tokens';
import { RefundPaymentHandler } from '../../../../modules/payment/application/handlers/refund-payment.handler';
import { RETURN_REFUND_TOKENS } from '../../../../modules/return-refund/contracts/tokens';
import { ApproveReturnRequestHandler } from '../../../../modules/return-refund/application/handlers/approve-return-request.handler';
import { CreateReturnRequestHandler } from '../../../../modules/return-refund/application/handlers/create-return-request.handler';
import { ProcessReturnRefundHandler } from '../../../../modules/return-refund/application/handlers/process-return-refund.handler';
import { RejectReturnRequestHandler } from '../../../../modules/return-refund/application/handlers/reject-return-request.handler';
import { PrismaOutboxStore } from '../../../../modules/return-refund/infrastructure/prisma/prisma-outbox-store';
import { PrismaReturnRequestRepository } from '../../../../modules/return-refund/infrastructure/repositories/prisma-return-request-repository';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { OrderReturnValidationAdapter } from './adapters/order-return-validation.adapter';
import { PaymentRefundAdapter } from './adapters/payment-refund.adapter';
import { ReturnsController } from './controllers/returns.controller';

@Module({
  imports: [OrderModule, PaymentModule],
  controllers: [ReturnsController],
  providers: [
    {
      provide: RETURN_REFUND_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: PrismaReturnRequestRepository,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaReturnRequestRepository(prisma, outboxStore),
      inject: [PrismaService, RETURN_REFUND_TOKENS.OUTBOX_STORE],
    },
    {
      provide: RETURN_REFUND_TOKENS.RETURN_REQUEST_REPOSITORY,
      useExisting: PrismaReturnRequestRepository,
    },
    {
      provide: RETURN_REFUND_TOKENS.ORDER_RETURN_VALIDATION_SERVICE,
      useFactory: (orderRepository, paymentRepository) =>
        new OrderReturnValidationAdapter(orderRepository, paymentRepository),
      inject: [ORDER_TOKENS.ORDER_REPOSITORY, PAYMENT_TOKENS.PAYMENT_REPOSITORY],
    },
    {
      provide: RETURN_REFUND_TOKENS.PAYMENT_REFUND_SERVICE,
      useFactory: (refundPaymentHandler: RefundPaymentHandler) => new PaymentRefundAdapter(refundPaymentHandler),
      inject: [RefundPaymentHandler],
    },
    {
      provide: CreateReturnRequestHandler,
      useFactory: (orderReturnValidationService, returnRequestRepository) =>
        new CreateReturnRequestHandler(orderReturnValidationService, returnRequestRepository),
      inject: [
        RETURN_REFUND_TOKENS.ORDER_RETURN_VALIDATION_SERVICE,
        RETURN_REFUND_TOKENS.RETURN_REQUEST_REPOSITORY,
      ],
    },
    {
      provide: ApproveReturnRequestHandler,
      useFactory: (returnRequestRepository: PrismaReturnRequestRepository) =>
        new ApproveReturnRequestHandler(returnRequestRepository),
      inject: [RETURN_REFUND_TOKENS.RETURN_REQUEST_REPOSITORY],
    },
    {
      provide: RejectReturnRequestHandler,
      useFactory: (returnRequestRepository: PrismaReturnRequestRepository) =>
        new RejectReturnRequestHandler(returnRequestRepository),
      inject: [RETURN_REFUND_TOKENS.RETURN_REQUEST_REPOSITORY],
    },
    {
      provide: ProcessReturnRefundHandler,
      useFactory: (returnRequestRepository, paymentRefundService) =>
        new ProcessReturnRefundHandler(returnRequestRepository, paymentRefundService),
      inject: [RETURN_REFUND_TOKENS.RETURN_REQUEST_REPOSITORY, RETURN_REFUND_TOKENS.PAYMENT_REFUND_SERVICE],
    },
  ],
})
export class ReturnRefundModule {}
