# Catalog Service

Core microservice for product catalog, categories, brands, and inventory.

## Responsibilities

- Product CRUD with variants (SKU, attributes, pricing)
- Category tree and brand management
- Warehouse and inventory tracking (quantity, reserved, low-stock alerts)
- Redis caching for product detail and category tree
- Publish product and inventory events to Kafka

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
| HTTP port | `8082` |
| Health check | `GET /health` |
| API prefix | `/api/v1` |

## Kafka

| Direction | Topic | Events |
|-----------|-------|--------|
| Publish | `product-events` | `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED` |
| Publish | `inventory-events` | `STOCK_UPDATED`, `LOW_STOCK`, `OUT_OF_STOCK` |
| Consume | `user-events` | User lifecycle sync |

## Database entities

`categories`, `brands`, `products`, `product_images`, `attributes`, `attribute_values`, `product_variants`, `variant_attribute_values`, `warehouses`, `inventory`

See [docs/ERD.md](../../docs/ERD.md#2-catalog-service-postgresql--redis).

## Design notes

- Products support multiple variants (size, color, etc.)
- Inventory is tracked per variant per warehouse
- Product detail cached in Redis (TTL ~5 min)
- Soft delete via `status = archived`

## Project structure (target)

```
catalog-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
├── migrations/
└── config/
```

## Related tasks

- `SVC-CAT-001` → `SVC-CAT-004` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Catalog Service](../../docs/PROJECT_CONTEXT.md#42-catalog-service)
