# Review Module

**Bounded Context:** Review

**Responsibility:** Product reviews and ratings — submission, moderation (draft → published), review images, and `ReviewCreated` event publication.

**Dependencies / Communication:** Validates product references via Catalog repository contract and customer identity via User repository contract. Stores review images in MinIO through `IObjectStorage`. Publishes `ReviewCreated`, `ReviewUpdated`, and `ReviewPublished` through the Outbox.
