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

### Quick start

```bash
# 1. Infrastructure (from repo root)
cp .env.example .env
make dev-up && make dev-init

# 2. Configure service
cd services/catalog-service
cp .env.example .env
# Set DATABASE_DSN=postgres://nova:nova_dev_password@localhost:5433/catalog_db?sslmode=disable

# 3. Migrations + dev seed
make seed-dev

# 4. Run service
go run ./cmd/server
curl -s http://localhost:8082/health | jq
```

### Database migrations & seed

**Tool:** [golang-migrate](https://github.com/golang-migrate/migrate)  
**Location:** `migrations/`  
**Seed:** migration `008_seed_dev_data` (development only, idempotent)

| Make target | Description |
|-------------|-------------|
| `make migrate-up` | Apply all migrations including dev seed |
| `make seed-dev` | Alias for `migrate-up` |
| `make migrate-down` | Roll back one migration |
| `make seed-dev-psql` | Re-run seed SQL via psql (schema 001–007 must exist) |

Dev seed requires `app.environment=development` on the migrate connection (handled automatically by `make seed-dev`). See [migrations/README.md](migrations/README.md) for details.

**Development seed data:**

| Entity | Count | Notes |
|--------|-------|-------|
| Categories | 5 | `Điện tử` → `Điện thoại`, `Laptop`; `Thời trang`; `Gia dụng` |
| Brands | 3 | Apple, Samsung, Xiaomi |
| Products | 10 | Mixed categories/brands |
| Variants | 10 | One SKU per product |
| Warehouses | 1 | `WH-HCM-01` (active) |
| Inventory | 10 | One row per variant in sample warehouse |

`seller_id` uses dev placeholder UUID `a4010000-0000-4000-8000-000000000001` — align with Identity `seller@novacommerce.dev` when integrating auth.

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

## Project structure

```
catalog-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
├── migrations/
├── scripts/seed-dev.sql
├── Makefile
└── config/
```

## Related tasks

- `SVC-CAT-001` → `SVC-CAT-004` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Catalog Service](../../docs/PROJECT_CONTEXT.md#42-catalog-service)
