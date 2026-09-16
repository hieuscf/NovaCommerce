export const PAYMENT_TOKENS = {
  PAYMENT_INITIATION_SERVICE: Symbol('IPaymentInitiationService'),
  PAYMENT_REPOSITORY: Symbol('IPaymentRepository'),
  SAVED_PAYMENT_METHOD_REPOSITORY: Symbol('ISavedPaymentMethodRepository'),
  OUTBOX_STORE: Symbol('IPaymentOutboxStore'),
  PAYMENT_PROVIDER: Symbol('IPaymentProvider'),
  CARD_TOKENIZER: Symbol('ICardTokenizer'),
} as const;
