# Promotion Module

**Bounded Context:** Promotion

**Responsibility:** Promotions and coupons — rules, eligibility, application, and usage tracking.

**Dependencies / Communication:** Exposes promotion evaluation via public contracts to Cart and Checkout. Publishes `CouponUsed` and related events. Does not mutate Order or Cart aggregates directly.
