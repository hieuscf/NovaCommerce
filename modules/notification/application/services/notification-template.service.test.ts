import { describe, expect, it } from 'vitest';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationChannel } from '../../domain/value-objects/notification-channel';

describe('NotificationTemplateService', () => {
  const service = new NotificationTemplateService();

  it('resolves email template with placeholders', () => {
    const result = service.resolve('order.created', NotificationChannel.EMAIL, {
      orderNumber: 'ORD-123',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      subject: 'Order ORD-123 confirmed',
      body: 'Hello, your order ORD-123 has been placed successfully.',
    });
  });

  it('resolves push template with placeholders', () => {
    const result = service.resolve('payment.completed', NotificationChannel.PUSH, {
      orderId: 'order-1',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().body).toContain('Payment successful');
    expect(result.getValue().body).toContain('order-1');
  });

  it('fails for unknown template', () => {
    const result = service.resolve('unknown.template', NotificationChannel.EMAIL, {});
    expect(result.isFailure).toBe(true);
  });
});
