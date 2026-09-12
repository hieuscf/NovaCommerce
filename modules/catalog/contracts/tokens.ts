export const CATALOG_TOKENS = {
  PRODUCT_REPOSITORY: Symbol('IProductRepository'),
  CATEGORY_REPOSITORY: Symbol('ICategoryRepository'),
  OUTBOX_STORE: Symbol('ICatalogOutboxStore'),
} as const;
