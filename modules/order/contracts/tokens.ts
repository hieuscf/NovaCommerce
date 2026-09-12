export const ORDER_TOKENS = {
  ORDER_REPOSITORY: Symbol('IOrderRepository'),
  OUTBOX_STORE: Symbol('IOrderOutboxStore'),
  CREATE_ORDER_FROM_CHECKOUT: Symbol('ICreateOrderFromCheckoutService'),
} as const;
