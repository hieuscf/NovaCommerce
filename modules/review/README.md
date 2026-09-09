# Review Module

**Bounded Context:** Review

**Responsibility:** Product reviews and ratings — submission, moderation, and aggregate rating read models.

**Dependencies / Communication:** Validates product/user references via contracts. Publishes `ReviewCreated` events. Does not own Catalog product data.
