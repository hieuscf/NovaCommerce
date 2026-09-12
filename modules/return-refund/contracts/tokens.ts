export const RETURN_REFUND_TOKENS = {
  RETURN_REQUEST_REPOSITORY: Symbol('IReturnRequestRepository'),
  OUTBOX_STORE: Symbol('IReturnRefundOutboxStore'),
  ORDER_RETURN_VALIDATION_SERVICE: Symbol('IOrderReturnValidationService'),
  PAYMENT_REFUND_SERVICE: Symbol('IPaymentRefundService'),
} as const;
