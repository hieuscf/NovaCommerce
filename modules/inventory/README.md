# Inventory Module

**Bounded Context:** Inventory

**Responsibility:** Stock levels, reservations, adjustments, and release — ensuring sellable quantity and reservation invariants.

**Aggregate Root:** `InventoryItem` (stock item per SKU + warehouse)

**Entities:** `StockReservation`, `StockAdjustment`

**Value Objects:** `Sku`, `Quantity`, `ReservationId`, `WarehouseId`

**Domain Events:** `StockAdjusted`, `StockReserved`, `StockReservationReleased`, `StockDepleted`

**Consumed Events:** `OrderCreated` (via inventory-side contract with reservation lines)

**Dependencies / Communication:** Reacts to `OrderCreated` through the in-memory event bus. Publishes inventory domain events via Outbox. Does not access Order or Catalog repositories directly.
