import { isIntegrationEvent, type BusEvent } from '@novacommerce/building-blocks';

export interface PaymentFailedNotificationContract {
  readonly paymentId: string;
  readonly reason: string;
}

function isPaymentFailedEvent(event: BusEvent): boolean {
  if (isIntegrationEvent(event)) {
    return event.eventType === 'payment.failed';
  }

  return event.eventName === 'PaymentFailed';
}

function readEventPayload(event: BusEvent): Record<string, unknown> {
  if (isIntegrationEvent(event)) {
    return event.payload ?? {};
  }

  if ('payload' in event && typeof event.payload === 'object' && event.payload !== null) {
    return event.payload as Record<string, unknown>;
  }

  return {};
}

function readAggregateId(event: BusEvent): string {
  if (isIntegrationEvent(event)) {
    return event.aggregateId;
  }

  return event.aggregateId;
}

export function parsePaymentFailedNotificationContract(
  event: BusEvent,
): PaymentFailedNotificationContract | null {
  if (!isPaymentFailedEvent(event)) {
    return null;
  }

  const payload = readEventPayload(event);

  if (typeof payload.reason !== 'string' || payload.reason.trim().length === 0) {
    return null;
  }

  return {
    paymentId: readAggregateId(event),
    reason: payload.reason.trim(),
  };
}
