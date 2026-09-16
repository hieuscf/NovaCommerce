/**
 * Product search index settings. Analysis is limited to a lowercase normalizer
 * for exact-match keyword fields. Typo tolerance, ranking, and vector search
 * are out of scope for this foundation.
 */
export const PRODUCT_SEARCH_SETTINGS: Record<string, unknown> = {
  analysis: {
    normalizer: {
      lowercase_normalizer: {
        type: 'custom',
        filter: ['lowercase'],
      },
    },
  },
};
