# Payment Module

**Bounded Context:** Payment

**Responsibility:** Payment lifecycle — payment intent, confirmation, failure, refund foundation, and payment provider integration.

**Dependencies / Communication:** Triggered by Checkout via `IPaymentInitiationService`. Publishes `PaymentInitiated`, `PaymentSucceeded`, `PaymentFailed`, and `PaymentRefunded` through the Outbox. Payment provider implementations live in Infrastructure only (`IPaymentProvider`).

## Application Handlers

- `InitiatePaymentHandler` — creates payment intent and provider redirect URL
- `ConfirmPaymentHandler` — records successful payment with provider reference
- `FailPaymentHandler` — records payment failure
- `RefundPaymentHandler` — refund foundation for succeeded payments

**API (Gateway)**

- `POST /api/v1/payments/intents`
- `POST /api/v1/payments/:paymentId/confirm`
- `POST /api/v1/payments/:paymentId/fail`
- `POST /api/v1/payments/:paymentId/refund`
- `GET /api/v1/users/me/payment-methods` — list saved cards (metadata only)
- `POST /api/v1/users/me/payment-methods` — save card (no CVV; tokenized immediately)
- `DELETE /api/v1/users/me/payment-methods/:paymentMethodId`
- `POST /api/v1/users/me/payment-methods/:paymentMethodId/default`

Saved cards follow ADR-006: never store CVV/CVC or full PAN.
