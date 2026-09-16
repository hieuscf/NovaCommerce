import { describe, expect, it } from 'vitest';
import { buildCategoryIndex, PRODUCT_IMAGE_FALLBACK } from '@/lib/catalog/mappers';
import { mapSearchItemToViewModel } from '../mappers';
import type { ProductSearchItemDto } from '../types';

describe('mapSearchItemToViewModel', () => {
  it('maps a Search hit onto the shop product card model', () => {
    const item: ProductSearchItemDto = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      slug: 'nova-headphones',
      name: 'Nova Headphones',
      status: 'published',
      brand: { id: 'brand-1', name: 'Nova Audio' },
      categories: [{ id: 'cat-phones', name: 'Smartphones' }],
      price: 99.99,
      currency: 'USD',
      images: ['https://cdn.example/headphones.jpg'],
      attributes: [{ name: 'Rating', value: '4.5' }],
      tags: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };

    const categories = buildCategoryIndex([
      {
        id: 'cat-electronics',
        name: 'Electronics',
        slug: 'electronics',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-phones',
        name: 'Smartphones',
        slug: 'smartphones',
        parentId: 'cat-electronics',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(mapSearchItemToViewModel(item, categories)).toMatchObject({
      id: item.id,
      slug: 'nova-headphones',
      name: 'Nova Headphones',
      brand: 'Nova Audio',
      price: 99.99,
      currency: 'USD',
      rating: 4.5,
      imageUrl: 'https://cdn.example/headphones.jpg',
      categorySlug: 'smartphones',
      departmentSlug: 'electronics',
    });
  });

  it('uses the catalog image fallback when Search has no images', () => {
    const item: ProductSearchItemDto = {
      id: '1',
      slug: 'plain',
      name: 'Plain',
      status: 'published',
      categories: [],
      price: 10,
      currency: 'USD',
      images: [],
      attributes: [],
      tags: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    expect(mapSearchItemToViewModel(item, buildCategoryIndex([])).imageUrl).toBe(PRODUCT_IMAGE_FALLBACK);
  });
});
