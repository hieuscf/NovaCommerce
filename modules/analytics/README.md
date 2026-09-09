# Analytics Module

**Bounded Context:** Analytics

**Responsibility:** Reporting, metrics, and analytics — event ingestion, dashboards, and business intelligence read models.

**Dependencies / Communication:** Consumes domain events from Order, User, Catalog, and others (eventual consistency). CQRS/reporting focus — does not mutate source aggregates.
