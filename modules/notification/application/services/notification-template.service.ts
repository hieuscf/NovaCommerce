import { Result } from '@novacommerce/building-blocks';
import { NotificationDomainError } from '../../domain/errors/notification-domain.error';
import {
  NOTIFICATION_TEMPLATES,
  type NotificationTemplateDefinition,
} from '../../domain/templates/notification-templates';
import { NotificationChannel } from '../../domain/value-objects/notification-channel';

export interface ResolvedNotificationContent {
  readonly subject?: string;
  readonly body: string;
}

export class NotificationTemplateService {
  resolve(
    templateKey: string,
    channel: NotificationChannel,
    payload: Record<string, string>,
  ): Result<ResolvedNotificationContent, NotificationDomainError> {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    if (!template) {
      return Result.fail(new NotificationDomainError('Template not found', 'TEMPLATE_NOT_FOUND'));
    }

    if (channel === NotificationChannel.EMAIL) {
      if (!template.emailSubject || !template.emailBody) {
        return Result.fail(
          new NotificationDomainError('Email template is not configured', 'EMAIL_TEMPLATE_NOT_CONFIGURED'),
        );
      }

      return Result.ok({
        subject: this.interpolate(template.emailSubject, payload),
        body: this.interpolate(template.emailBody, payload),
      });
    }

    if (!template.pushTitle || !template.pushBody) {
      return Result.fail(
        new NotificationDomainError('Push template is not configured', 'PUSH_TEMPLATE_NOT_CONFIGURED'),
      );
    }

    return Result.ok({
      body: `${this.interpolate(template.pushTitle, payload)}\n${this.interpolate(template.pushBody, payload)}`,
    });
  }

  getTemplate(templateKey: string): NotificationTemplateDefinition | undefined {
    return NOTIFICATION_TEMPLATES[templateKey];
  }

  private interpolate(template: string, payload: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => payload[key] ?? '');
  }
}
