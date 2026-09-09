import type { Notification } from '../aggregates/notification';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  save(notification: Notification): Promise<void>;
}
