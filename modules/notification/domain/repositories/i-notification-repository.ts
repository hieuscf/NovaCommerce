import type { Notification } from '../aggregates/notification';

export interface PendingDeliveryRecord {
  readonly notificationId: string;
  readonly deliveryId: string;
}

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  save(notification: Notification): Promise<void>;
  findPendingDeliveries(limit: number): Promise<readonly PendingDeliveryRecord[]>;
}
