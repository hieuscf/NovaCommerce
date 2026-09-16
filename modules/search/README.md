# Search Module

**Bounded Context:** Search

**Status:** Read model / CQRS. Product indexer consumes Catalog events. Keyword search API reads OpenSearch only.

Search is the product **read/search model**. Catalog remains the source of truth for products. Search never writes back to Catalog and never queries PostgreSQL for product data.

```text
WRITE SIDE                         READ SIDE
Catalog                            Client
  ├── ProductCreated                 │
  └── ProductUpdated                 ▼
         │                     SearchController
         ▼                           │
    Event Bus                        ▼
         │                   SearchProductsHandler
         ▼                           │
  ProductIndexer              ┌──────┴──────┐
         │                    HIT          MISS
         ▼                    │             │
 ProductSearchDocument        │             ▼
         │                    │     IProductSearchIndex
         ▼                    │             │
 IProductSearchIndex          │             ▼
         │                    │        OpenSearch
         ▼                    │             │
     OpenSearch               └──────┬──────┘
                                     ▼
                              Search result (cached)
```

> **Search does not query PostgreSQL.** Product search data is projected from Catalog events into OpenSearch. Search must not access Catalog Prisma models, `IProductRepository`, or Catalog entities. The Search API hydrates responses from the OpenSearch document, not from Catalog.

## Responsibility

- Product search read model (`ProductSearchDocument`)
- Product search index port (`IProductSearchIndex`)
- OpenSearch index name, mapping, settings, and lifecycle (`ensureIndex`)
- Product indexer (read-model projection from `ProductCreated` / `ProductUpdated`)
- Keyword search, filtering, sorting, pagination
- Search API (`GET /api/v1/search/products`)
- Short-TTL search result cache (`ICache` / Redis)

Search-specific concepts stay in this module so it can be extracted as a microservice without changing the domain model.

## Search API

```http
GET /api/v1/search/products
```

Public. Results come from the OpenSearch product index.

The customer storefront (`apps/web`) calls this from `/shop` and `/shop/[category]`. The header search box submits `q` to `/shop?q=`. Category slugs are resolved to `categoryId` via Catalog `GET /categories`. The storefront never queries PostgreSQL for product search.

| Parameter | Type | Notes |
|-----------|------|--------|
| `q` | string | Optional keyword. Omit to browse (`match_all` + filters). Max 200 characters. |
| `categoryId` | UUID | Exact match on nested `categories.id` |
| `brandId` | UUID | Exact match on `brand.id` |
| `minPrice` | number ≥ 0 | Inclusive price range |
| `maxPrice` | number ≥ 0 | Inclusive price range; must be ≥ `minPrice` |
| `status` | `draft` \| `published` \| `archived` | Exact match. Search does **not** hide non-published products by default. |
| `sort` | whitelist | See sorting below |
| `page` | integer ≥ 1 | Default `1` |
| `pageSize` | integer 1–100 | Default `20` (same limit as other collection APIs) |

Unsupported query parameters (including arbitrary OpenSearch fields) are rejected. Raw OpenSearch DSL is not accepted.

Keyword is optional. An empty `q` is treated as browse: filters + sort + pagination against the index.

Response (wrapped in the gateway `{ data, meta }` envelope):

```json
{
  "items": [],
  "total": 125,
  "page": 1,
  "pageSize": 20,
  "totalPages": 7
}
```

Each item is the Search read model (id, slug, name, description, status, brand, categories, price, currency, images, attributes, tags, timestamps). It is not the Catalog Product aggregate.

### Supported filters

Only fields present on `ProductSearchDocument` / the product index mapping:

- `categoryId` → nested `term` on `categories.id`
- `brandId` → `term` on `brand.id`
- `status` → `term` on `status`
- `minPrice` / `maxPrice` → `range` on `price`

There is no `availability` field on the search document, so it is not exposed.

### Supported sorting

| Value | OpenSearch sort |
|-------|-----------------|
| `relevance` | `_score` desc (default when `q` is present) |
| `price_asc` / `price_desc` | `price` |
| `name_asc` / `name_desc` | `name.keyword` |
| `createdAt_asc` / `createdAt_desc` | `createdAt` (default browse sort when `q` is omitted) |

Every sort adds `id` asc as a tie-breaker so pagination is stable. Invalid `sort` values return a validation error.

### Pagination

Offset pagination: `from = (page - 1) * pageSize`, `size = pageSize`. Requests whose `from` would exceed the OpenSearch result window (10_000) are rejected. Deep pagination (`search_after`) is not implemented.

## Caching

Search results are cached at the `SearchProductsHandler` boundary using the shared Redis `ICache` abstraction. Cache keys are `search:products:{sha256(normalized-query)}`. Equivalent queries (different HTTP parameter order, keyword letter-case) share a key.

| Env | Default | Meaning |
|-----|---------|---------|
| `SEARCH_CACHE_ENABLED` | `true` | Disable without code changes |
| `SEARCH_CACHE_TTL_SECONDS` | `60` | Short TTL because ProductCreated/ProductUpdated can change the index |

TTL-based expiration is the invalidation strategy. Redis failures are logged and ignored: OpenSearch is still queried and the API remains available. Invalid requests and infrastructure errors are not cached. Current results are public (no auth-dependent payload).

## Architecture

```text
HTTP DTO
    ↓
SearchProductsHandler (validate / normalize / cache)
    ↓
IProductSearchIndex.search(ProductSearchCriteria)
    ↓
OpenSearch query DSL (infrastructure only)
```

Application code never imports `@opensearch-project/opensearch`. OpenSearch SDK usage stays in `OpenSearchClientService`.

## Domain Boundary

Search **does not own** the Catalog Product aggregate.

Do not import:

- Catalog `Product` entity / aggregate
- `IProductRepository` / Catalog Prisma models

Search receives product data only through:

- Domain / integration event contracts (`ProductCreated`, `ProductUpdated`)
- `ProductSearchIndexContract` (Search-owned mapping input)

Catalog events are the input of the product indexer. The indexer is a read-model projection, not a Catalog write path.

## Product Indexer

`ProductIndexer` maps a Search contract to `ProductSearchDocument` and writes through `IProductSearchIndex`.

| Capability | Event | Index operation |
|------------|--------|-----------------|
| `indexProduct` | `ProductCreated` / `catalog.product_created` | `indexDocument` |
| `updateProduct` | `ProductUpdated` / `catalog.product_updated` | `updateDocument` |

Document ID is the Catalog product aggregate ID. Retries of the same event update the same document (at-least-once, idempotent by ID). No random document IDs.

Catalog emits a **full product snapshot** on create and update. Search replaces/upserts the document from that snapshot. Search does not patch unknown fields and does not invent status rules (for example it does not hide non-`published` products).

Optional Search document fields (`description`, `brand`, `tags`, category **names**) are mapped when present on the event. Catalog currently publishes `categoryId`, images, attributes, price, currency, and status (`draft` / `published` / `archived`); it does not currently publish brand, tags, or description.

`Product.publish()` also emits `ProductUpdated` so the search document reflects `published` status.

## OpenSearch Role

OpenSearch is the Search read store.

The official OpenSearch client is created in shared infrastructure (`OpenSearchClientService` → `ISearchClient` in `@novacommerce/infrastructure` / `@novacommerce/building-blocks`). Search application code depends on `IProductSearchIndex` only.

Handlers, the indexer, and the search use case never instantiate an OpenSearch client.

## Product Search Index

| Item | Value |
|------|--------|
| Default index name | `novacommerce-products` |
| Constant | `PRODUCT_SEARCH_INDEX` |
| Override | `OPENSEARCH_PRODUCT_INDEX` (optional) |

On gateway startup, `EnsureProductSearchIndexHandler` calls `ensureIndex()`. If the index already exists, startup continues. The application does not crash solely because the index is already present.

Handlers are registered on the process EventBus in `SearchModule` (gateway) and in the outbox worker so Catalog outbox events are consumed after publish.

### Mapping overview

| Purpose | Fields |
|---------|--------|
| Identifiers / exact match | `id`, `slug`, `status`, `currency`, `brand.id`, `categories.id` |
| Searchable text | `name`, `description`, `brand.name`, `categories.name` |
| Filtering / facets | `status`, brand, nested `categories`, nested `attributes`, `tags` |
| Sorting | `price`, `name.keyword`, `createdAt`, `updatedAt` |

Keyword fields use a lowercase normalizer. Custom analyzers, typo tolerance, ranking, and vector/semantic search are out of scope.

## Configuration

Required (existing app config):

```text
OPENSEARCH_URL
REDIS_URL
```

The outbox worker also requires `OPENSEARCH_URL` so Search handlers can index after outbox publish.

Optional:

```text
OPENSEARCH_USERNAME
OPENSEARCH_PASSWORD
OPENSEARCH_PRODUCT_INDEX   # default: novacommerce-products
SEARCH_CACHE_ENABLED       # default: true
SEARCH_CACHE_TTL_SECONDS   # default: 60
```

Credentials are only required when the deployment enables OpenSearch security. Local Docker Compose disables the security plugin.

Do not hard-code hosts, passwords, index names, or cache TTLs in business code.

## Local Development

Start OpenSearch (and Redis for cache) with the existing Compose files:

```bash
docker compose -f docker-compose.dev.yml up -d opensearch redis
```

From the host: `OPENSEARCH_URL=http://localhost:9200`, `REDIS_URL=redis://:change-me@localhost:6379/0`

Inside Docker: use service names (`opensearch`, `redis`), not `localhost`.

## Testing

```bash
pnpm --filter @novacommerce/gateway run test
pnpm --filter @novacommerce/infrastructure run test
```

Unit tests cover document construction, query normalization, OpenSearch query DSL (filters/sort/from-size), cache keys, use-case cache hit/miss/failure, indexer/handler behavior, and idempotent document IDs.

Gateway API tests cover `GET /api/v1/search/products` validation, pagination metadata, and OpenAPI.

Integration tests create the product index against a live cluster when `INTEGRATION_OPENSEARCH_URL` is set:

```bash
INTEGRATION_OPENSEARCH_URL=http://localhost:9200 pnpm --filter @novacommerce/gateway run test
```

Indexing flow: ProductCreated → document exists → ProductUpdated → same document updated.

Query flow: keyword, filters, sort, pagination, combined query, empty result.

## Failure handling

OpenSearch **indexing** failures are logged and rethrown. The outbox publisher records the failure and does not mark the message processed, so delivery can be retried. Handlers must not swallow indexing errors.

OpenSearch **query** failures are logged and mapped to `SEARCH_UNAVAILABLE` (HTTP 503). Internal exception details are not returned to the client.

Redis cache failures do not fail the Search API.

## Dependency Rules

- Search → Catalog infrastructure / Prisma / repository: **forbidden**
- Search Domain → NestJS / OpenSearch SDK / Prisma: **forbidden**
- Search Application → OpenSearch client: **forbidden**
- Search Infrastructure implements `IProductSearchIndex` using `ISearchClient`

## Limitations

- No autocomplete, suggestions, search analytics, semantic/vector search, or AI ranking (AI platform)
- No `availability` filter (field is not on the search document)
- Brand, tags, description, and category names are only searchable when Catalog events include them
- Storefronts that should show only published products must pass `status=published`
- Cache invalidation is TTL-based; a product update may be visible in search cache for up to `SEARCH_CACHE_TTL_SECONDS`
- Offset pagination only; `from` is capped by the OpenSearch result window

## Future Tasks

- Autocomplete, semantic/vector search (AI platform — not this module)
- Search-after / cursor pagination if deep pages are required
- Event-driven cache invalidation if TTL is insufficient
