# Discovery Service

Core microservice for search, recommendations, and personalization.

## Responsibilities

- Full-text product search (Elasticsearch)
- Autocomplete and trending keywords
- Semantic / hybrid search (Qdrant vectors)
- Product recommendations (similar, bought-together, personalized feed)
- Sync read models from Kafka events (CQRS)

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go (Gin) |
| Search | Elasticsearch (BM25) |
| Vector DB | Qdrant (semantic search) |
| Cache | Redis |
| Messaging | Kafka |

## Local development

| Setting | Value |
|---------|-------|
| HTTP port | `8086` |
| Health check | `GET /health` |
| API prefix | `/api/v1` |
| Elasticsearch | `:9200` |
| Qdrant | `:6333` |

## Kafka

| Direction | Topic | Purpose |
|-----------|-------|---------|
| Consume | `product-events` | Index / update / delete products |
| Consume | `order-events` | Update sold count, purchase history |
| Consume | `review-events` | Update `avg_rating`, `review_count` |

**No dedicated PostgreSQL** — data synced from Catalog via Kafka.

## Index entities

`SEARCH_INDEX_PRODUCTS`, `SEARCH_SUGGESTIONS`, `USER_SEARCH_HISTORY`, `TRENDING_KEYWORDS`

See [docs/ERD.md](../../docs/ERD.md#6-discovery-service-elasticsearch--qdrant).

## Search modes

| Mode | Description |
|------|-------------|
| `keyword` | Elasticsearch BM25 only |
| `semantic` | Qdrant vector similarity |
| `hybrid` | RRF fusion of BM25 + vector (default) |

## Design notes

- CQRS: read model separated from Catalog write model
- Product embeddings generated on index (name + description + category)
- Fallback to Elasticsearch if Qdrant is unavailable
- Recommendation cache in Redis (TTL ~30 min)

## Project structure (target)

```
discovery-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
└── config/
```

## Related tasks

- `SVC-DIS-001` → `SVC-DIS-003` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Discovery Service](../../docs/PROJECT_CONTEXT.md#46-discovery-service)
