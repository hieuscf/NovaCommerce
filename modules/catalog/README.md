# Catalog Module

**Bounded Context:** Catalog

**Responsibility:** Product catalog — products, variants, categories, attributes, and pricing at the catalog level.

**Dependencies / Communication:** Publishes catalog events (`ProductCreated`, `ProductPublished`, etc.). Search and Cart consume via contracts/events. Does not query Order or Inventory data directly.
