# Commerce Service

Core microservice for shopping cart, orders, coupons, and returns.

## Responsibilities

- Shopping cart (Redis session + PostgreSQL persistence at checkout)
- Order creation, lifecycle, and cancellation
- Coupon validation and application
- Return and refund requests
- Outbox pattern for reliable Kafka publishing

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go (Gin) |
| Database | PostgreSQL |
| Cache | Redis (cart TTL 7 days) |
| Messaging | Kafka |

## Local development

| Setting | Value |
|---------|-------|
| HTTP port | `8083` |
| Health check | `GET /health` |
| API prefix | `/api/v1` |

## Kafka

| Direction | Topic | Events |
|-----------|-------|--------|
| Publish | `cart-events` | `ITEM_ADDED`, `ITEM_REMOVED`, `CART_CLEARED` |
| Publish | `order-events` | `ORDER_CREATED`, `ORDER_CONFIRMED`, `ORDER_CANCELLED`, `ORDER_COMPLETED` |
| Consume | `user-events` | User lifecycle |
| Consume | `product-events` | Product updates for cart validation |
| Consume | `payment-events` | Update order after payment |

## Database entities

`carts`, `cart_items`, `orders`, `order_items`, `order_status_history`, `coupons`, `returns`, `return_items`, `outbox_events`

See [docs/ERD.md](../../docs/ERD.md#3-commerce-service-postgresql--redis).

## Order status flow

```
pending → confirmed → processing → shipped → delivered
                              ↘ cancelled
```

## Design notes

- `order_items.snapshot` (jsonb) stores product data at order time
- Cart items store price snapshot when added
- Order number format: `NC-YYYYMMDD-XXXXXXXX`
- Saga pattern coordinates order → payment → inventory

## Project structure (target)

```
commerce-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
├── migrations/
└── config/
```

## Related tasks

- `SVC-CMS-001` → `SVC-CMS-004` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Commerce Service](../../docs/PROJECT_CONTEXT.md#43-commerce-service)
