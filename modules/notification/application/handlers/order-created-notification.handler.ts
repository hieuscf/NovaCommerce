import type { BusEvent } from '@novacommerce/building-blocks';
import { parseOrderCreatedNotificationContract } from '../contracts/order-created.contract';
import { NotificationApplicationError } from '../errors/notification-application.error';
import { RecipientResolverService } from '../services/recipient-resolver.service';
import { RequestNotificationService } from '../services/request-notification.service';
import { NotificationChannel } from '../../domain/value-objects/notification-channel';

export class OrderCreatedNotificationHandler {
  constructor(
    private readonly requestNotificationService: RequestNotificationService,
    private readonly recipientResolver: RecipientResolverService,
  ) {}

  async handle(event: BusEvent): Promise<void> {
    const contract = parseOrderCreatedNotificationContract(event);
    if (!contract) {
      throw new NotificationApplicationError(
        'Invalid OrderCreated payload for notification',
        'INVALID_ORDER_CREATED',
      );
    }

    const result = await this.requestNotificationService.execute({
      templateKey: 'order.created',
      payload: {
        orderNumber: contract.orderNumber,
        customerId: contract.customerId,
        orderId: contract.orderId,
      },
      deliveries: [
        {
          channel: NotificationChannel.EMAIL,
          recipient: this.recipientResolver.resolve(NotificationChannel.EMAIL, contract.customerId),
        },
        {
          channel: NotificationChannel.PUSH,
          recipient: this.recipientResolver.resolve(NotificationChannel.PUSH, contract.customerId),
        },
      ],
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }
}
