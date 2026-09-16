import { describe, expect, it } from 'vitest';
import {
  buildCategoryIndex,
  countProductsInCategoryTree,
  mapCategoryToViewModel,
  mapProductToViewModel,
} from '../mappers';
import type { CategoryDto, ProductDto } from '../types';

const categories: CategoryDto[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-laptops',
    name: 'Laptops',
    slug: 'laptops',
    parentId: 'cat-electronics',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const product: ProductDto = {
  id: 'prod-1',
  name: 'Nova Book 13',
  slug: 'nova-book-13',
  basePriceAmount: 899,
  basePriceCurrency: 'USD',
  status: 'published',
  categoryId: 'cat-laptops',
  variants: [
    {
      id: 'var-1',
      sku: 'NB-13',
      priceAmount: 899,
      priceCurrency: 'USD',
      attributes: { Color: 'Space Gray', Storage: '256GB' },
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ],
  images: [
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
      sortOrder: 0,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ],
  attributes: [
    {
      id: 'attr-1',
      name: 'Brand',
      value: 'Nova',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'attr-2',
      name: 'Rating',
      value: '4.7',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'attr-3',
      name: 'CompareAtPrice',
      value: '999',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ],
  options: [],
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('catalog mappers', () => {
  it('maps product DTOs onto listing view-models', () => {
    const index = buildCategoryIndex(categories);
    const view = mapProductToViewModel(product, index);

    expect(view.slug).toBe('nova-book-13');
    expect(view.brand).toBe('Nova');
    expect(view.price).toBe(899);
    expect(view.compareAtPrice).toBe(999);
    expect(view.badge).toBe('sale');
    expect(view.discountPercent).toBe(10);
    expect(view.rating).toBe(4.7);
    expect(view.categorySlug).toBe('laptops');
    expect(view.departmentSlug).toBe('electronics');
    expect(view.variant).toBe('Space Gray · 256GB');
  });

  it('maps root categories with product counts in the tree', () => {
    const index = buildCategoryIndex(categories);
    const count = countProductsInCategoryTree('cat-electronics', index, [product]);
    const view = mapCategoryToViewModel(categories[0]!, count);

    expect(count).toBe(1);
    expect(view.slug).toBe('electronics');
    expect(view.productCount).toBe(1);
    expect(view.imageUrl).toContain('unsplash');
  });
});
