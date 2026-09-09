# Payment Module

**Bounded Context:** Payment

**Responsibility:** Payment lifecycle — authorization, capture, refund coordination, and payment provider integration.

**Dependencies / Communication:** Triggered by Order/Checkout events. Publishes `PaymentSucceeded` and related events. Payment provider implementations live in Infrastructure only.
