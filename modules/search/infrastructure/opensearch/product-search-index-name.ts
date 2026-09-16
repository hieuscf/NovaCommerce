export const PRODUCT_SEARCH_INDEX = 'novacommerce-products';

export function resolveProductSearchIndexName(indexName?: string): string {
  const trimmed = indexName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : PRODUCT_SEARCH_INDEX;
}
