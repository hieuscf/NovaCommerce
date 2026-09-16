const textWithKeyword: Record<string, unknown> = {
  type: 'text',
  fields: {
    keyword: {
      type: 'keyword',
      ignore_above: 256,
      normalizer: 'lowercase_normalizer',
    },
  },
};

const exactKeyword: Record<string, unknown> = {
  type: 'keyword',
  normalizer: 'lowercase_normalizer',
};

/**
 * Mapping for ProductSearchDocument.
 *
 * Identifiers / exact match: id, slug, status, currency, brand.id, categories.id
 * Searchable text: name, description, brand.name, categories.name
 * Filtering: status, brand, categories, attributes, tags
 * Sorting: price, createdAt, updatedAt
 */
export const PRODUCT_SEARCH_MAPPINGS: Record<string, unknown> = {
  properties: {
    id: exactKeyword,
    slug: exactKeyword,
    name: textWithKeyword,
    description: { type: 'text' },
    status: exactKeyword,
    brand: {
      properties: {
        id: exactKeyword,
        name: textWithKeyword,
      },
    },
    categories: {
      type: 'nested',
      properties: {
        id: exactKeyword,
        name: textWithKeyword,
      },
    },
    price: { type: 'double' },
    currency: exactKeyword,
    images: { type: 'keyword' },
    attributes: {
      type: 'nested',
      properties: {
        name: exactKeyword,
        value: {
          type: 'keyword',
          normalizer: 'lowercase_normalizer',
          fields: {
            text: { type: 'text' },
          },
        },
      },
    },
    tags: exactKeyword,
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
