import { Inject, Module, OnModuleInit } from '@nestjs/common';
import type { IEventBus } from '@novacommerce/building-blocks';
import { NOTIFICATION_TOKENS } from '../../../../modules/notification/contracts/tokens';
import { OrderCreatedNotificationHandler } from '../../../../modules/notification/application/handlers/order-created-notification.handler';
import { PaymentFailedNotificationHandler } from '../../../../modules/notification/application/handlers/payment-failed-notification.handler';
import { PaymentSucceededNotificationHandler } from '../../../../modules/notification/application/handlers/payment-succeeded-notification.handler';
import { registerNotificationEventHandlers } from '../../../../modules/notification/application/register-notification-event-handlers';
import { DeliveryRetryPolicy } from '../../../../modules/notification/application/services/delivery-retry-policy';
import { NotificationTemplateService } from '../../../../modules/notification/application/services/notification-template.service';
import { ProcessNotificationDeliveryService } from '../../../../modules/notification/application/services/process-notification-delivery.service';
import { RecipientResolverService } from '../../../../modules/notification/application/services/recipient-resolver.service';
import { RequestNotificationService } from '../../../../modules/notification/application/services/request-notification.service';
import { NotificationProcessor } from '../../../../modules/notification/application/workers/notification-processor';
import { ConsoleLogger } from '../../../../modules/notification/infrastructure/logging/console-logger';
import { PrismaOutboxStore } from '../../../../modules/notification/infrastructure/prisma/prisma-outbox-store';
import { PrismaNotificationRepository } from '../../../../modules/notification/infrastructure/repositories/prisma-notification-repository';
import { StubEmailChannel } from '../../../../modules/notification/infrastructure/services/stub-email-channel';
import { StubPushChannel } from '../../../../modules/notification/infrastructure/services/stub-push-channel';
import { EVENT_BUS } from '../infrastructure/events/event-bus.module';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Module({
  providers: [
    {
      provide: NOTIFICATION_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: NOTIFICATION_TOKENS.NOTIFICATION_REPOSITORY,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaNotificationRepository(prisma, outboxStore),
      inject: [PrismaService, NOTIFICATION_TOKENS.OUTBOX_STORE],
    },
    {
      provide: NOTIFICATION_TOKENS.EMAIL_CHANNEL,
      useFactory: () => new StubEmailChannel(),
    },
    {
      provide: NOTIFICATION_TOKENS.PUSH_CHANNEL,
      useFactory: () => new StubPushChannel(),
    },
    NotificationTemplateService,
    RecipientResolverService,
    DeliveryRetryPolicy,
    {
      provide: RequestNotificationService,
      useFactory: (repository: PrismaNotificationRepository) => new RequestNotificationService(repository),
      inject: [NOTIFICATION_TOKENS.NOTIFICATION_REPOSITORY],
    },
    {
      provide: ProcessNotificationDeliveryService,
      useFactory: (
        repository: PrismaNotificationRepository,
        templateService: NotificationTemplateService,
        emailChannel: StubEmailChannel,
        pushChannel: StubPushChannel,
        retryPolicy: DeliveryRetryPolicy,
      ) =>
        new ProcessNotificationDeliveryService(
          repository,
          templateService,
          emailChannel,
          pushChannel,
          retryPolicy,
          new ConsoleLogger({ module: 'notification' }),
        ),
      inject: [
        NOTIFICATION_TOKENS.NOTIFICATION_REPOSITORY,
        NotificationTemplateService,
        NOTIFICATION_TOKENS.EMAIL_CHANNEL,
        NOTIFICATION_TOKENS.PUSH_CHANNEL,
        DeliveryRetryPolicy,
      ],
    },
    {
      provide: NotificationProcessor,
      useFactory: (
        repository: PrismaNotificationRepository,
        processDeliveryService: ProcessNotificationDeliveryService,
      ) =>
        new NotificationProcessor(
          repository,
          processDeliveryService,
          new ConsoleLogger({ module: 'notification' }),
        ),
      inject: [NOTIFICATION_TOKENS.NOTIFICATION_REPOSITORY, ProcessNotificationDeliveryService],
    },
    {
      provide: OrderCreatedNotificationHandler,
      useFactory: (requestNotificationService: RequestNotificationService, recipientResolver: RecipientResolverService) =>
        new OrderCreatedNotificationHandler(requestNotificationService, recipientResolver),
      inject: [RequestNotificationService, RecipientResolverService],
    },
    {
      provide: PaymentSucceededNotificationHandler,
      useFactory: (requestNotificationService: RequestNotificationService, recipientResolver: RecipientResolverService) =>
        new PaymentSucceededNotificationHandler(requestNotificationService, recipientResolver),
      inject: [RequestNotificationService, RecipientResolverService],
    },
    {
      provide: PaymentFailedNotificationHandler,
      useFactory: (requestNotificationService: RequestNotificationService, recipientResolver: RecipientResolverService) =>
        new PaymentFailedNotificationHandler(requestNotificationService, recipientResolver),
      inject: [RequestNotificationService, RecipientResolverService],
    },
  ],
  exports: [NOTIFICATION_TOKENS.NOTIFICATION_REPOSITORY, NotificationProcessor],
})
export class NotificationModule implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    private readonly orderCreatedHandler: OrderCreatedNotificationHandler,
    private readonly paymentSucceededHandler: PaymentSucceededNotificationHandler,
    private readonly paymentFailedHandler: PaymentFailedNotificationHandler,
  ) {}

  onModuleInit(): void {
    registerNotificationEventHandlers(
      this.eventBus,
      this.orderCreatedHandler,
      this.paymentSucceededHandler,
      this.paymentFailedHandler,
    );
  }
}
