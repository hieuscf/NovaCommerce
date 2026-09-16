import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getShopPageModel } from '../get-shop-page';
import type { CategoryDto } from '../types';
import type { ProductSearchListDto } from '@/lib/search/types';

const listCategories = vi.fn();
const searchProducts = vi.fn();

vi.mock('../client', () => ({
  catalogClient: {
    listCategories: (...args: unknown[]) => listCategories(...args),
    listProducts: vi.fn(),
    getProductBySlug: vi.fn(),
    getProductById: vi.fn(),
    getCategoryById: vi.fn(),
  },
}));

vi.mock('@/lib/search/client', () => ({
  searchClient: {
    searchProducts: (...args: unknown[]) => searchProducts(...args),
  },
}));

const categories: CategoryDto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Electronics',
    slug: 'electronics',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const searchResult: ProductSearchListDto = {
  items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      slug: 'nova-phone-x',
      name: 'Nova Phone X',
      status: 'published',
      categories: [{ id: '550e8400-e29b-41d4-a716-446655440001', name: 'Electronics' }],
      price: 799,
      currency: 'USD',
      images: [],
      attributes: [{ name: 'Brand', value: 'Nova' }],
      tags: [],
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 12,
  totalPages: 1,
};

describe('getShopPageModel', () => {
  beforeEach(() => {
    listCategories.mockReset();
    searchProducts.mockReset();
    listCategories.mockResolvedValue(categories);
    searchProducts.mockResolvedValue(searchResult);
  });

  it('loads a collection route from Gateway Search', async () => {
    const model = await getShopPageModel({ q: 'phone' }, 'electronics');

    expect(searchProducts).toHaveBeenCalledWith({
      q: 'phone',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      minPrice: undefined,
      maxPrice: undefined,
      status: 'published',
      sort: 'relevance',
      page: 1,
      pageSize: 12,
    });
    expect(model).not.toBeNull();
    expect(model?.query.collection).toBe('electronics');
    expect(model?.header.title).toBe('Electronics');
    expect(model?.total).toBe(1);
    expect(model?.products[0]?.slug).toBe('nova-phone-x');
  });

  it('returns null for an unknown collection slug', async () => {
    await expect(getShopPageModel({}, 'not-a-collection')).resolves.toBeNull();
    expect(searchProducts).not.toHaveBeenCalled();
  });
});
