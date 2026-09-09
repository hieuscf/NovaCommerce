# Shipping Module

**Bounded Context:** Shipping

**Responsibility:** Shipment and fulfillment — shipping methods, labels, tracking, and delivery status.

**Dependencies / Communication:** Reacts to order fulfillment events. Integrates with carrier providers in Infrastructure. No direct access to Order aggregates — uses contracts and events.
