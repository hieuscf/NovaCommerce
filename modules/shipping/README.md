# Shipping Module

**Bounded Context:** Shipping

**Responsibility:** Shipment and fulfillment — shipping methods, quotes, shipment creation, tracking, and delivery status.

**Dependencies / Communication:** Reacts to order fulfillment events. Integrates with carrier providers in Infrastructure via `IShippingProvider`. No direct access to Order aggregates — uses contracts and events.

## Application Handlers

- `CalculateShippingHandler` — returns shipping cost quote for a method and destination
- `CreateShipmentHandler` — creates shipment with destination and line items
- `TrackShipmentHandler` — retrieves shipment status and tracking history
- `DispatchShipmentHandler` — assigns tracking number and marks shipment dispatched

## Domain Events

- `ShipmentCreated`
- `ShipmentDispatched`
- `ShipmentInTransit`
- `ShipmentDelivered`

Events are persisted via Outbox when the shipment aggregate is saved.

## API (Gateway)

- `POST /api/v1/shipping/quotes`
- `POST /api/v1/shipping/shipments`
- `GET /api/v1/shipping/shipments/:shipmentId`
- `GET /api/v1/shipping/track/:trackingNumber`
- `POST /api/v1/shipping/shipments/:shipmentId/dispatch`

## Shipping Calculation

The stub provider uses flat base rate plus per-item surcharge per method code (`standard`, `express`). Override via `SHIPPING_RATE_<METHOD>` env var (`base,perItem,estimatedDays`).
