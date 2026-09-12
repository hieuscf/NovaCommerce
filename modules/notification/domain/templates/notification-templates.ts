export interface NotificationTemplateDefinition {
  readonly key: string;
  readonly emailSubject?: string;
  readonly emailBody?: string;
  readonly pushTitle?: string;
  readonly pushBody?: string;
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplateDefinition> = {
  'order.created': {
    key: 'order.created',
    emailSubject: 'Order {{orderNumber}} confirmed',
    emailBody: 'Hello, your order {{orderNumber}} has been placed successfully.',
    pushTitle: 'Order confirmed',
    pushBody: 'Your order {{orderNumber}} has been placed.',
  },
  'payment.completed': {
    key: 'payment.completed',
    emailSubject: 'Payment received for order {{orderId}}',
    emailBody: 'Payment for order {{orderId}} was completed successfully.',
    pushTitle: 'Payment successful',
    pushBody: 'Payment for order {{orderId}} was completed.',
  },
  'payment.failed': {
    key: 'payment.failed',
    emailSubject: 'Payment failed',
    emailBody: 'Payment {{paymentId}} failed: {{reason}}',
    pushTitle: 'Payment failed',
    pushBody: 'Payment {{paymentId}} failed: {{reason}}',
  },
};
