import { isIntegrationEvent, type BusEvent } from '@novacommerce/building-blocks';

export interface PaymentSucceededNotificationContract {
  readonly paymentId: string;
  readonly orderId: string;
}

function isPaymentSucceededEvent(event: BusEvent): boolean {
  if (isIntegrationEvent(event)) {
    return event.eventType === 'payment.completed';
  }

  return event.eventName === 'PaymentSucceeded';
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

export function parsePaymentSucceededNotificationContract(
  event: BusEvent,
): PaymentSucceededNotificationContract | null {
  if (!isPaymentSucceededEvent(event)) {
    return null;
  }

  const payload = readEventPayload(event);

  if (typeof payload.orderId !== 'string') {
    return null;
  }

  return {
    paymentId: readAggregateId(event),
    orderId: payload.orderId,
  };
}
