# Cart Module

**Bounded Context:** Cart

**Responsibility:** Shopping cart — add/update/remove items, cart persistence, Redis caching, and pre-checkout state.

**Dependencies / Communication:** Resolves customer identity via User module repository interface. Stores product references as logical Catalog refs only. Hands off to Checkout via application contracts. No direct imports from Order, Payment, or Inventory internals.

## API (Gateway)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/users/me/cart` | Get or create current customer cart |
| POST | `/api/v1/users/me/cart/items` | Add item (merge quantity when line exists) |
| PATCH | `/api/v1/users/me/cart/items/:itemId` | Update item quantity |
| DELETE | `/api/v1/users/me/cart/items/:itemId` | Remove item |
| DELETE | `/api/v1/users/me/cart` | Clear cart |
