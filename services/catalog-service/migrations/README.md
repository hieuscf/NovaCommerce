# Catalog Service — Database Migrations

Tool: [golang-migrate](https://github.com/golang-migrate/migrate)

Format: `{version}_{description}.up.sql` / `{version}_{description}.down.sql`

Naming convention: 3-digit version prefix (`001`, `002`, …)

## Tables

| Version | Migration | Tables |
|---------|-----------|--------|
| 001 | `create_categories` | `categories` |
| 002 | `create_brands` | `brands` |
| 003 | `create_products` | `products`, `product_images` |
| 004 | `create_attributes` | `attributes`, `attribute_values` |
| 005 | `create_product_variants` | `product_variants`, `variant_attribute_values` |
| 006 | `create_warehouses` | `warehouses` |
| 007 | `create_inventory` | `inventory` |
| 008 | `seed_dev_data` | Dev seed: categories, brands, products, variants, warehouse, inventory |

## Run

```bash
# From services/catalog-service
migrate -path ./migrations -database "$DATABASE_URL" up

# Rollback one step
migrate -path ./migrations -database "$DATABASE_URL" down 1

# Rollback all
migrate -path ./migrations -database "$DATABASE_URL" down
```

Example `DATABASE_URL` (Docker Compose — Postgres on host port **5433**):

```
postgres://nova:nova_dev_password@localhost:5433/catalog_db?sslmode=disable
```

### Development seed (migration `008`)

Seed runs only when `app.environment = 'development'` (same pattern as Identity Service migration `005`).

```bash
cd services/catalog-service

# Recommended — applies schema + seed (idempotent)
make seed-dev

# Or manually with golang-migrate
export DATABASE_URL="postgres://nova:nova_dev_password@localhost:5433/catalog_db?sslmode=disable&options=-c%20app.environment%3Ddevelopment"
migrate -path ./migrations -database "$DATABASE_URL" up

# Re-apply seed only (after schema 001-007)
make seed-dev-psql
```

**Seed contents:** 5 categories (tree), 3 brands, 10 products, 10 variants, 1 warehouse, 10 inventory rows.
