export const REVIEW_TOKENS = {
  REVIEW_REPOSITORY: Symbol('IReviewRepository'),
  OUTBOX_STORE: Symbol('IReviewOutboxStore'),
  REVIEW_IMAGE_STORAGE: Symbol('IReviewImageStorage'),
} as const;
