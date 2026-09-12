export const PAYMENT_TOKENS = {
  PAYMENT_INITIATION_SERVICE: Symbol('IPaymentInitiationService'),
  PAYMENT_REPOSITORY: Symbol('IPaymentRepository'),
  OUTBOX_STORE: Symbol('IPaymentOutboxStore'),
  PAYMENT_PROVIDER: Symbol('IPaymentProvider'),
} as const;
