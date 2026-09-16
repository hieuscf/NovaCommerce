import { describe, expect, it } from 'vitest';
import { mapProductSearchDocumentToSource } from './map-product-search-document';
import { mapProductSearchSourceToDocument } from './map-product-search-source';
import { ProductSearchDocument } from '../../domain/entities/product-search-document';

describe('mapProductSearchSourceToDocument', () => {
  it('round-trips a product search document source', () => {
    const document = ProductSearchDocument.create({
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'nova-headphones',
      name: 'Nova Headphones',
      description: 'Wireless',
      status: 'published',
      brand: { id: 'brand-1', name: 'Nova Audio' },
      categories: [{ id: 'cat-1', name: 'Headphones' }],
      price: 99.99,
      currency: 'USD',
      images: ['https://cdn.example/headphones.jpg'],
      attributes: [{ name: 'color', value: 'black' }],
      tags: ['audio'],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    }).getValue();

    const mapped = mapProductSearchSourceToDocument(mapProductSearchDocumentToSource(document));

    expect(mapped.isSuccess).toBe(true);
    expect(mapped.getValue()).toMatchObject({
      id: document.id,
      slug: document.slug,
      name: document.name,
      price: 99.99,
      status: 'published',
    });
  });

  it('fails when timestamps are missing', () => {
    const result = mapProductSearchSourceToDocument({ id: '1', name: 'A', slug: 'a' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_PRODUCT_SEARCH_HIT');
  });
});
