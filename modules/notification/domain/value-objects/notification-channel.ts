export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
}

export function isNotificationChannel(value: string): value is NotificationChannel {
  return value === NotificationChannel.EMAIL || value === NotificationChannel.PUSH;
}
