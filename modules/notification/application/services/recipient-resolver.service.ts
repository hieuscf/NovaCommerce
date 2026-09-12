import { NotificationChannel } from '../../domain/value-objects/notification-channel';

/**
 * Resolves delivery recipients from event payload identifiers without cross-module database access.
 * Email uses a local stub convention; push uses customer-scoped device tokens.
 */
export class RecipientResolverService {
  resolve(channel: NotificationChannel, customerId: string): string {
    if (channel === NotificationChannel.EMAIL) {
      return `${customerId}@customer.novacommerce.local`;
    }

    return `customer:${customerId}`;
  }

  resolveForPayment(channel: NotificationChannel, paymentId: string): string {
    if (channel === NotificationChannel.EMAIL) {
      return `payment-${paymentId}@customer.novacommerce.local`;
    }

    return `payment:${paymentId}`;
  }
}
