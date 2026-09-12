# Promotion Module

**Bounded Context:** Promotion

**Responsibility:** Promotions and coupons — rules, eligibility, discount calculation, and usage tracking.

**Dependencies / Communication:** Exposes promotion evaluation via public contracts to Cart and Checkout. Publishes `CouponUsed` and related events through the outbox. Does not mutate Order or Cart aggregates directly.

## Application Use Cases

| Handler | Purpose |
|---------|---------|
| `ValidateCouponHandler` | Validates coupon code, promotion eligibility, and usage limits |
| `CalculateDiscountHandler` | Calculates discount amount for a valid coupon |
| `UseCouponHandler` | Records coupon redemption and emits `CouponUsed` |
| `EvaluatePromotionService` | Checkout integration contract for promotion evaluation |

## API (Gateway)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/promotions/coupons/validate` | Validate coupon |
| POST | `/promotions/discounts/calculate` | Calculate discount |

## Domain Model

- **Aggregates:** Promotion, Coupon
- **Entities:** PromotionRule, PromotionBenefit, CouponRedemption
- **Value Objects:** CouponCode, Percentage, Money, DateRange
- **Events:** PromotionActivated, PromotionDeactivated, CouponApplied, CouponUsed
