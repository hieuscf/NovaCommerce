import { BaseEntity } from '@novacommerce/building-blocks';

export enum DeliveryStatus { PENDING = 'pending', SENT = 'sent', FAILED = 'failed' }

export class NotificationDelivery extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private channel: string, private recipient: string,
    private status: DeliveryStatus, private failureReason?: string,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, channel: string, recipient: string): NotificationDelivery {
    return new NotificationDelivery(id, new Date(), new Date(), channel, recipient, DeliveryStatus.PENDING);
  }

  markSent(): void { this.status = DeliveryStatus.SENT; this.updatedAt = new Date(); }
  markFailed(reason: string): void { this.status = DeliveryStatus.FAILED; this.failureReason = reason; this.updatedAt = new Date(); }
  getChannel(): string { return this.channel; }
  getRecipient(): string { return this.recipient; }
  getStatus(): DeliveryStatus { return this.status; }
}
