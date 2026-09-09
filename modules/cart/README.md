# Cart Module

**Bounded Context:** Cart

**Responsibility:** Shopping cart — add/update/remove items, cart persistence, and pre-checkout state.

**Dependencies / Communication:** Reads product availability via Catalog public contracts. Hands off to Checkout via application contracts. No direct imports from Order, Payment, or Inventory internals.
