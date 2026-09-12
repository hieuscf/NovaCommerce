export const NOTIFICATION_TOKENS = {
  NOTIFICATION_REPOSITORY: Symbol('INotificationRepository'),
  OUTBOX_STORE: Symbol('INotificationOutboxStore'),
  EMAIL_CHANNEL: Symbol('IEmailChannel'),
  PUSH_CHANNEL: Symbol('IPushChannel'),
  EVENT_BUS: Symbol('IEventBus'),
} as const;
