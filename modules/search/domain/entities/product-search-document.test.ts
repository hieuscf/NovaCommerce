import { describe, expect, it } from 'vitest';
import { ProductSearchDocument } from './product-search-document';

function validProps() {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'nova-headphones',
    name: 'Nova Headphones',
    status: 'published' as const,
    price: 99.99,
    currency: 'usd',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };
}

describe('ProductSearchDocument', () => {
  it('creates a search read model without requiring Catalog fields', () => {
    const result = ProductSearchDocument.create(validProps());

    expect(result.isSuccess).toBe(true);
    const document = result.getValue();
    expect(document.id).toBe('11111111-1111-1111-1111-111111111111');
    expect(document.slug).toBe('nova-headphones');
    expect(document.name).toBe('Nova Headphones');
    expect(document.status).toBe('published');
    expect(document.price).toBe(99.99);
    expect(document.currency).toBe('USD');
    expect(document.categories).toEqual([]);
    expect(document.images).toEqual([]);
    expect(document.attributes).toEqual([]);
    expect(document.tags).toEqual([]);
    expect(document.brand).toBeUndefined();
    expect(document.description).toBeUndefined();
  });

  it('normalizes optional search fields used for filtering and facets', () => {
    const result = ProductSearchDocument.create({
      ...validProps(),
      description: '  Wireless over-ear headphones  ',
      brand: { id: ' brand-1 ', name: ' Nova Audio ' },
      categories: [{ id: ' cat-1 ', name: ' Headphones ' }],
      images: [' https://cdn.example/image.jpg ', ''],
      attributes: [{ name: ' color ', value: ' black ' }],
      tags: [' wireless ', ''],
    });

    expect(result.isSuccess).toBe(true);
    const document = result.getValue();
    expect(document.description).toBe('Wireless over-ear headphones');
    expect(document.brand).toEqual({ id: 'brand-1', name: 'Nova Audio' });
    expect(document.categories).toEqual([{ id: 'cat-1', name: 'Headphones' }]);
    expect(document.images).toEqual(['https://cdn.example/image.jpg']);
    expect(document.attributes).toEqual([{ name: 'color', value: 'black' }]);
    expect(document.tags).toEqual(['wireless']);
  });

  it('rejects missing identifiers and name', () => {
    expect(ProductSearchDocument.create({ ...validProps(), id: '  ' }).getError().code).toBe(
      'INVALID_PRODUCT_SEARCH_ID',
    );
    expect(ProductSearchDocument.create({ ...validProps(), slug: '' }).getError().code).toBe(
      'INVALID_PRODUCT_SEARCH_SLUG',
    );
    expect(ProductSearchDocument.create({ ...validProps(), name: ' ' }).getError().code).toBe(
      'INVALID_PRODUCT_SEARCH_NAME',
    );
  });

  it('rejects invalid status, price, and currency', () => {
    expect(
      ProductSearchDocument.create({ ...validProps(), status: 'hidden' as never }).getError().code,
    ).toBe('INVALID_PRODUCT_SEARCH_STATUS');
    expect(ProductSearchDocument.create({ ...validProps(), price: -1 }).getError().code).toBe(
      'INVALID_PRODUCT_SEARCH_PRICE',
    );
    expect(ProductSearchDocument.create({ ...validProps(), currency: 'US' }).getError().code).toBe(
      'INVALID_PRODUCT_SEARCH_CURRENCY',
    );
  });

  it('rejects incomplete brand, category, and attribute references', () => {
    expect(
      ProductSearchDocument.create({ ...validProps(), brand: { id: '', name: 'Nova' } }).getError().code,
    ).toBe('INVALID_PRODUCT_SEARCH_BRAND');
    expect(
      ProductSearchDocument.create({
        ...validProps(),
        categories: [{ id: 'cat-1', name: '' }],
      }).getError().code,
    ).toBe('INVALID_PRODUCT_SEARCH_CATEGORY');
    expect(
      ProductSearchDocument.create({
        ...validProps(),
        attributes: [{ name: 'color', value: '  ' }],
      }).getError().code,
    ).toBe('INVALID_PRODUCT_SEARCH_ATTRIBUTE');
  });
});
