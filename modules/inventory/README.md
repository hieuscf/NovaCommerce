# Inventory Module

**Bounded Context:** Inventory

**Responsibility:** Stock levels, reservations, and release — ensuring sellable quantity and reservation invariants.

**Dependencies / Communication:** Reacts to order/checkout events (`StockReserved`, etc.). Publishes inventory events. Catalog and Order communicate only through contracts and domain events.
