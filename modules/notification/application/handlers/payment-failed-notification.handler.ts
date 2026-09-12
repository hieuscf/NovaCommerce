import type { BusEvent } from '@novacommerce/building-blocks';
import { parsePaymentFailedNotificationContract } from '../contracts/payment-failed.contract';
import { NotificationApplicationError } from '../errors/notification-application.error';
import { RecipientResolverService } from '../services/recipient-resolver.service';
import { RequestNotificationService } from '../services/request-notification.service';
import { NotificationChannel } from '../../domain/value-objects/notification-channel';

export class PaymentFailedNotificationHandler {
  constructor(
    private readonly requestNotificationService: RequestNotificationService,
    private readonly recipientResolver: RecipientResolverService,
  ) {}

  async handle(event: BusEvent): Promise<void> {
    const contract = parsePaymentFailedNotificationContract(event);
    if (!contract) {
      throw new NotificationApplicationError(
        'Invalid PaymentFailed payload for notification',
        'INVALID_PAYMENT_FAILED',
      );
    }

    const result = await this.requestNotificationService.execute({
      templateKey: 'payment.failed',
      payload: {
        paymentId: contract.paymentId,
        reason: contract.reason,
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
