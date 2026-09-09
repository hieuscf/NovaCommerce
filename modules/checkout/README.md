# Checkout Module

**Bounded Context:** Checkout

**Responsibility:** Checkout orchestration — validate cart, apply promotions, coordinate order creation flow.

**Dependencies / Communication:** Orchestrates via application services and events across Cart, Promotion, Order, and Inventory. Does not own order or payment domain logic.
