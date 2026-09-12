export const PROMOTION_TOKENS = {
  COUPON_REPOSITORY: Symbol('ICouponRepository'),
  PROMOTION_REPOSITORY: Symbol('IPromotionRepository'),
  PROMOTION_EVALUATION_SERVICE: Symbol('IPromotionEvaluationService'),
  OUTBOX_STORE: Symbol('IPromotionOutboxStore'),
} as const;
