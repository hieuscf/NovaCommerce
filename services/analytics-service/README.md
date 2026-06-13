# Analytics Service

Supporting microservice exposing business intelligence APIs over ClickHouse.

## Responsibilities

- Revenue and GMV analytics
- Top products and seller performance
- User conversion funnel (browse → cart → purchase)
- Cache heavy analytics queries in Redis

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go (Gin) |
| Analytics DB | ClickHouse |
| Cache | Redis |
| BI | Apache Superset (dashboards) |

## API (target)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/revenue` | Revenue by period |
| `GET` | `/analytics/top-products` | Best-selling products |
| `GET` | `/analytics/user-funnel` | Conversion funnel |
| `GET` | `/analytics/seller/:id/summary` | Seller summary |

## ClickHouse schema

Star schema with fact tables (`fact_orders`, `fact_order_items`, `fact_pageviews`, `fact_search_events`) and dimensions (`dim_date`, `dim_users`, `dim_products`).

See [docs/ERD.md](../../docs/ERD.md#7-data-platform-clickhouse--analytics-warehouse).

## Design notes

- Read-only service — data ingested via Data Platform pipeline
- Query results cached in Redis (TTL ~5 min)
- Superset connects directly to ClickHouse for analyst dashboards

## Project structure (target)

```
analytics-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
└── config/
```

## Related tasks

- `DATA-005` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Data Platform](../../docs/PROJECT_CONTEXT.md#9-data-platform-pipeline)
