# Order Module

**Bounded Context:** Order

**Responsibility:** Order lifecycle — creation, confirmation, fulfillment states, cancellation, and completion.

**Dependencies / Communication:** Publishes `OrderCreated` and related events. Inventory, Payment, Shipping, and Notification react via events. Never imports Inventory or Payment repositories directly.
