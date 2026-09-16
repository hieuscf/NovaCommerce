import { describe, expect, it } from 'vitest';
import { parseShopQuery } from '@/lib/url/shop-query';
import { toSearchProductsQuery, toSearchSort } from '../to-search-query';
import type { CategoryDto } from '@/lib/catalog/types';

const categories: CategoryDto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Electronics',
    slug: 'electronics',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Smartphones',
    slug: 'smartphones',
    parentId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('toSearchProductsQuery', () => {
  it('maps keyword, category slug, price, and pagination onto the Search API', () => {
    const query = parseShopQuery(
      { q: 'phone', minPrice: '10', maxPrice: '200', sort: 'price-asc', page: '2' },
      { collection: 'electronics' },
    );

    expect(toSearchProductsQuery(query, categories)).toEqual({
      q: 'phone',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      minPrice: 10,
      maxPrice: 200,
      status: 'published',
      sort: 'price_asc',
      page: 2,
      pageSize: 12,
    });
  });

  it('prefers a leaf category filter over the collection', () => {
    const query = parseShopQuery({ category: 'smartphones' }, { collection: 'electronics' });

    expect(toSearchProductsQuery(query, categories).categoryId).toBe(
      '550e8400-e29b-41d4-a716-446655440002',
    );
  });

  it('defaults featured sort to relevance when a keyword is present', () => {
    expect(toSearchSort(parseShopQuery({ q: 'laptop' }))).toBe('relevance');
    expect(toSearchSort(parseShopQuery({}))).toBe('createdAt_desc');
  });
});
