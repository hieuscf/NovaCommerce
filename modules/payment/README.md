# Payment Module

**Bounded Context:** Payment

**Responsibility:** Payment lifecycle — payment intent, confirmation, failure, refund foundation, and payment provider integration.

**Dependencies / Communication:** Triggered by Checkout via `IPaymentInitiationService`. Publishes `PaymentInitiated`, `PaymentSucceeded`, `PaymentFailed`, and `PaymentRefunded` through the Outbox. Payment provider implementations live in Infrastructure only (`IPaymentProvider`).

## Application Handlers

- `InitiatePaymentHandler` — creates payment intent and provider redirect URL
- `ConfirmPaymentHandler` — records successful payment with provider reference
- `FailPaymentHandler` — records payment failure
- `RefundPaymentHandler` — refund foundation for succeeded payments

## API (Gateway)

- `POST /api/v1/payments/intents`
- `POST /api/v1/payments/:paymentId/confirm`
- `POST /api/v1/payments/:paymentId/fail`
- `POST /api/v1/payments/:paymentId/refund`
