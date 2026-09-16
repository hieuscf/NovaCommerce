# ADR-006: Saved Cards via Provider Token — Never Store CVV

> **Status:** Accepted  
> **Date:** 2026-09-16  
> **Context:** Storefront needs saved payment cards for faster checkout without storing sensitive authentication data.

## Decision

1. **Saved payment methods** live in the Payment bounded context as aggregate `SavedPaymentMethod`.
2. NovaCommerce **persists only** non-sensitive metadata: `providerToken` (opaque), `brand`, `last4`, `expMonth`, `expYear`, `cardholderName`, `isDefault`, `customerId`.
3. **CVV/CVC is never accepted on save APIs, never persisted, never logged.** Schema must not include a CVV column.
4. **Every charge** that uses a saved card requires the shopper to re-enter CVV in the browser. CVV may be sent only to a PCI-compliant payment provider (or remain client-only until a real vault provider is wired). It must not be written to Gateway logs, Outbox payloads, or PostgreSQL.
5. Until a production card vault is selected, Infrastructure uses a **stub tokenizer** that discards the PAN after deriving `last4` / `brand` / opaque `providerToken`. Full PAN is not stored.

## Consequences

- Account and checkout UIs must omit CVV on “Add card” and require CVV when paying with a saved card.
- Gateway request DTOs for save/update must not declare `cvv` / `cvc` fields; validation rejects unknown sensitive fields when `forbidNonWhitelisted` is enabled.
- Replacing the stub tokenizer with Stripe/Adyen/etc. does not change the domain invariant: no CVV at rest.
