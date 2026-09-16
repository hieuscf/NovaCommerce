# Catalog Module

**Bounded Context:** Catalog

**Responsibility:** Product catalog — products, variants, categories, attributes, options, images, and catalog-level pricing.

## Aggregates

| Aggregate | Entities | Value Objects |
|-----------|----------|---------------|
| Product | ProductVariant, ProductImage, ProductAttribute, ProductOption | ProductName, ProductSlug, ProductSku, Money |
| Category | — | — |

> **Note:** Brand is not part of the approved domain model (`domain-model.md`) and is intentionally excluded.

## Domain Events

| Event | Trigger |
|-------|---------|
| ProductCreated | Product.create() |
| ProductUpdated | Product details, variants, images, price, publish, unpublish, archive |
| ProductPublished | Product.publish() |
| ProductPriceChanged | Product.changePrice() |

Events are persisted atomically via Outbox inside `PrismaProductRepository.save()`. `ProductCreated` and `ProductUpdated` carry a product snapshot (`name`, `slug`, `status`, `price`, `currency`, images, attributes, timestamps) so Search can project OpenSearch documents without querying Catalog.

## Repository Interfaces

- `IProductRepository` — Product aggregate persistence
- `ICategoryRepository` — Category aggregate persistence

## Application Use Cases

**Products:** CreateProduct, GetProductById, GetProductBySlug, ListProducts, UpdateProduct, ChangeProductPrice, PublishProduct, ArchiveProduct

**Categories:** CreateCategory, GetCategoryById, ListCategories, UpdateCategory

## API (Gateway)

Base path: `/api/v1`

| Method | Path | Auth |
|--------|------|------|
| GET | `/products` | Public |
| GET | `/products/:productId` | Public |
| GET | `/products/slug/:slug` | Public |
| POST | `/products` | `catalog:write` |
| PATCH | `/products/:productId` | `catalog:write` |
| POST | `/products/:productId/price` | `catalog:write` |
| POST | `/products/:productId/publish` | `catalog:write` |
| DELETE | `/products/:productId` | `catalog:write` (archive) |
| GET | `/categories` | Public |
| GET | `/categories/:categoryId` | Public |
| POST | `/categories` | `catalog:write` |
| PATCH | `/categories/:categoryId` | `catalog:write` |

## Persistence

Prisma models in `packages/database/prisma/schema.prisma`:

- `categories`, `products`, `product_variants`, `product_images`, `product_attributes`, `product_options`

## Module Boundaries

Catalog **does not** access Inventory, Cart, Order, Promotion, Search, or other module databases.

Cross-module communication uses domain events (`ProductCreated`, `ProductUpdated`, etc.) via Outbox.

## Testing

- Domain: `modules/catalog/domain/**/*.test.ts`
- Application: `modules/catalog/application/handlers/*.test.ts`
- Infrastructure: `modules/catalog/infrastructure/repositories/*.test.ts`
- API: `apps/gateway/src/catalog/catalog.test.ts`
