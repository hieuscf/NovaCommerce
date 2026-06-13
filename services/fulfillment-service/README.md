# Fulfillment Service

Core microservice for payments, shipping, and seller settlement.

## Responsibilities

- Payment session creation and gateway callbacks
- Refund processing
- Shipment creation and carrier webhook handling
- Shipment tracking history
- Invoice generation and seller settlement

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go (Gin) |
| Database | PostgreSQL |
| Cache | Redis |
| Messaging | Kafka |

## Local development

| Setting | Value |
|---------|-------|
| HTTP port | `8084` |
| Health check | `GET /health` |
| API prefix | `/api/v1` |

## Kafka

| Direction | Topic | Events |
|-----------|-------|--------|
| Publish | `payment-events` | `PAYMENT_INITIATED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED` |
| Publish | `shipping-events` | `SHIPMENT_CREATED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `FAILED` |
| Consume | `order-events` | `ORDER_CREATED`, `ORDER_CONFIRMED` |

## Database entities

`payment_methods`, `payments`, `refunds`, `shipping_carriers`, `shipments`, `shipment_tracking`, `invoices`

See [docs/ERD.md](../../docs/ERD.md#4-fulfillment-service-postgresql).

## Payment gateways (adapter pattern)

| Provider | Type |
|----------|------|
| VNPay | Online payment |
| MoMo | E-wallet |
| COD | Cash on delivery |

## Shipping carriers (adapter pattern)

| Provider | Region |
|----------|--------|
| GHN | Vietnam |
| GHTK | Vietnam |

## Design notes

- Payment gateway adapter interface for easy provider extension
- Idempotent payment processing via `transaction_id`
- Full shipment tracking event history
- Auto-generate invoice when order is `DELIVERED`

## Project structure (target)

```
fulfillment-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
├── migrations/
└── config/
```

## Related tasks

- `SVC-FS-001` → `SVC-FS-004` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Fulfillment Service](../../docs/PROJECT_CONTEXT.md#44-fulfillment-service)
