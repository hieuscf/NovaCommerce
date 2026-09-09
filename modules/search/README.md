# Search Module

**Bounded Context:** Search

**Status:** Domain layer skipped — read model / CQRS context with no transactional aggregate.

Search indexes product data via events (ProductUpdated → Indexer → OpenSearch).
