import { describe, expect, it } from 'vitest';
import { PRODUCT_SEARCH_MAPPINGS } from './product-search-mapping';
import { PRODUCT_SEARCH_SETTINGS } from './product-search-settings';

function readProperties(): Record<string, Record<string, unknown>> {
  const properties = PRODUCT_SEARCH_MAPPINGS.properties;
  if (typeof properties !== 'object' || properties === null) {
    throw new Error('Product search mapping is missing properties');
  }

  return properties as Record<string, Record<string, unknown>>;
}

describe('product search index definition', () => {
  it('defines a lowercase normalizer for exact matching', () => {
    const analysis = PRODUCT_SEARCH_SETTINGS.analysis as {
      normalizer?: { lowercase_normalizer?: { type?: string; filter?: string[] } };
    };

    expect(analysis.normalizer?.lowercase_normalizer?.type).toBe('custom');
    expect(analysis.normalizer?.lowercase_normalizer?.filter).toEqual(['lowercase']);
  });

  it('maps identifiers and status for exact matching, not full-text', () => {
    const properties = readProperties();

    expect(properties.id?.type).toBe('keyword');
    expect(properties.slug?.type).toBe('keyword');
    expect(properties.status?.type).toBe('keyword');
    expect(properties.currency?.type).toBe('keyword');
    expect(properties.tags?.type).toBe('keyword');
  });

  it('maps searchable text with keyword subfields', () => {
    const properties = readProperties();

    expect(properties.name?.type).toBe('text');
    expect(properties.description?.type).toBe('text');

    const nameFields = properties.name?.fields as { keyword?: { type?: string } } | undefined;
    expect(nameFields?.keyword?.type).toBe('keyword');
  });

  it('maps filter, sort, and nested facet fields', () => {
    const properties = readProperties();

    expect(properties.price?.type).toBe('double');
    expect(properties.createdAt?.type).toBe('date');
    expect(properties.updatedAt?.type).toBe('date');
    expect(properties.categories?.type).toBe('nested');
    expect(properties.attributes?.type).toBe('nested');
  });
});
