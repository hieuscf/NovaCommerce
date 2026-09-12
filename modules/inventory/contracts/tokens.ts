export const INVENTORY_TOKENS = {
  INVENTORY_ITEM_REPOSITORY: Symbol('IInventoryItemRepository'),
  OUTBOX_STORE: Symbol('IInventoryOutboxStore'),
  EVENT_BUS: Symbol('IEventBus'),
} as const;
