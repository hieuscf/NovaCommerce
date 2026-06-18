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

## Run

```bash
# From services/catalog-service
migrate -path ./migrations -database "$DATABASE_URL" up

# Rollback one step
migrate -path ./migrations -database "$DATABASE_URL" down 1

# Rollback all
migrate -path ./migrations -database "$DATABASE_URL" down
```

Example `DATABASE_URL`:

```
postgres://nova_catalog:secret@localhost:5432/catalog_db?sslmode=disable
```
