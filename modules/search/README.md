# Search Module

**Bounded Context:** Search

**Responsibility:** Product search and discovery — indexing, query, filters, and semantic search integration (via AI services).

**Dependencies / Communication:** Maintains read models from Catalog events. Uses OpenSearch in Infrastructure. CQRS read side — no writes to Catalog aggregates.
