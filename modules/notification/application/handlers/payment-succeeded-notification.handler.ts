import type { BusEvent } from '@novacommerce/building-blocks';
import { parsePaymentSucceededNotificationContract } from '../contracts/payment-succeeded.contract';
import { NotificationApplicationError } from '../errors/notification-application.error';
import { RecipientResolverService } from '../services/recipient-resolver.service';
import { RequestNotificationService } from '../services/request-notification.service';
import { NotificationChannel } from '../../domain/value-objects/notification-channel';

export class PaymentSucceededNotificationHandler {
  constructor(
    private readonly requestNotificationService: RequestNotificationService,
    private readonly recipientResolver: RecipientResolverService,
  ) {}

  async handle(event: BusEvent): Promise<void> {
    const contract = parsePaymentSucceededNotificationContract(event);
    if (!contract) {
      throw new NotificationApplicationError(
        'Invalid PaymentSucceeded payload for notification',
        'INVALID_PAYMENT_SUCCEEDED',
      );
    }

    const result = await this.requestNotificationService.execute({
      templateKey: 'payment.completed',
      payload: {
        orderId: contract.orderId,
        paymentId: contract.paymentId,
      },
      deliveries: [
        {
          channel: NotificationChannel.EMAIL,
          recipient: this.recipientResolver.resolveForPayment(
            NotificationChannel.EMAIL,
            contract.paymentId,
          ),
        },
        {
          channel: NotificationChannel.PUSH,
          recipient: this.recipientResolver.resolveForPayment(
            NotificationChannel.PUSH,
            contract.paymentId,
          ),
        },
      ],
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }
}
