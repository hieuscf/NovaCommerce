export const SHIPPING_TOKENS = {
  SHIPMENT_REPOSITORY: Symbol('IShipmentRepository'),
  OUTBOX_STORE: Symbol('IShippingOutboxStore'),
  SHIPPING_PROVIDER: Symbol('IShippingProvider'),
} as const;
