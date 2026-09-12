import type { IEventBus } from '@novacommerce/building-blocks';
import type { PrismaClient } from '@prisma/client';
import { OrderCreatedNotificationHandler } from '../../../modules/notification/application/handlers/order-created-notification.handler';
import { PaymentFailedNotificationHandler } from '../../../modules/notification/application/handlers/payment-failed-notification.handler';
import { PaymentSucceededNotificationHandler } from '../../../modules/notification/application/handlers/payment-succeeded-notification.handler';
import { registerNotificationEventHandlers } from '../../../modules/notification/application/register-notification-event-handlers';
import { DeliveryRetryPolicy } from '../../../modules/notification/application/services/delivery-retry-policy';
import { NotificationTemplateService } from '../../../modules/notification/application/services/notification-template.service';
import { ProcessNotificationDeliveryService } from '../../../modules/notification/application/services/process-notification-delivery.service';
import { RecipientResolverService } from '../../../modules/notification/application/services/recipient-resolver.service';
import { RequestNotificationService } from '../../../modules/notification/application/services/request-notification.service';
import { NotificationProcessor } from '../../../modules/notification/application/workers/notification-processor';
import { ConsoleLogger } from '../../../modules/notification/infrastructure/logging/console-logger';
import { PrismaOutboxStore } from '../../../modules/notification/infrastructure/prisma/prisma-outbox-store';
import { PrismaNotificationRepository } from '../../../modules/notification/infrastructure/repositories/prisma-notification-repository';
import { StubEmailChannel } from '../../../modules/notification/infrastructure/services/stub-email-channel';
import { StubPushChannel } from '../../../modules/notification/infrastructure/services/stub-push-channel';

export interface NotificationWorkerContext {
  readonly notificationProcessor: NotificationProcessor;
}

export function registerNotificationWorker(
  eventBus: IEventBus,
  prisma: PrismaClient,
): NotificationWorkerContext {
  const outboxStore = new PrismaOutboxStore(prisma);
  const repository = new PrismaNotificationRepository(prisma, outboxStore);
  const templateService = new NotificationTemplateService();
  const emailChannel = new StubEmailChannel();
  const pushChannel = new StubPushChannel();
  const retryPolicy = new DeliveryRetryPolicy();
  const logger = new ConsoleLogger({ module: 'notification' });

  const requestNotificationService = new RequestNotificationService(repository);
  const processDeliveryService = new ProcessNotificationDeliveryService(
    repository,
    templateService,
    emailChannel,
    pushChannel,
    retryPolicy,
    logger,
  );
  const notificationProcessor = new NotificationProcessor(repository, processDeliveryService, logger);

  registerNotificationEventHandlers(
    eventBus,
    new OrderCreatedNotificationHandler(requestNotificationService, new RecipientResolverService()),
    new PaymentSucceededNotificationHandler(requestNotificationService, new RecipientResolverService()),
    new PaymentFailedNotificationHandler(requestNotificationService, new RecipientResolverService()),
  );

  return { notificationProcessor };
}
