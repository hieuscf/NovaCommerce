import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHomepageCatalog } from '../get-homepage';
import type { CategoryDto, ProductDto, ProductListDto } from '../types';

const listCategories = vi.fn();
const listProducts = vi.fn();

vi.mock('../client', () => ({
  catalogClient: {
    listCategories: (...args: unknown[]) => listCategories(...args),
    listProducts: (...args: unknown[]) => listProducts(...args),
    getProductBySlug: vi.fn(),
    getProductById: vi.fn(),
    getCategoryById: vi.fn(),
  },
}));

describe('getHomepageCatalog', () => {
  beforeEach(() => {
    listCategories.mockReset();
    listProducts.mockReset();
  });

  it('returns root categories and featured products from Gateway', async () => {
    const categories: CategoryDto[] = [
      {
        id: 'root',
        name: 'Electronics',
        slug: 'electronics',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'child',
        name: 'Laptops',
        slug: 'laptops',
        parentId: 'root',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    const product: ProductDto = {
      id: 'p1',
      name: 'Featured Laptop',
      slug: 'featured-laptop',
      basePriceAmount: 1000,
      basePriceCurrency: 'USD',
      status: 'published',
      categoryId: 'child',
      variants: [],
      images: [],
      attributes: [],
      options: [],
      createdAt: '2026-09-10T00:00:00.000Z',
      updatedAt: '2026-09-10T00:00:00.000Z',
    };

    listCategories.mockResolvedValue(categories);
    listProducts.mockResolvedValue({
      items: [product],
      total: 1,
      page: 1,
      pageSize: 100,
    } satisfies ProductListDto);

    const home = await getHomepageCatalog();

    expect(home.categories).toHaveLength(1);
    expect(home.categories[0]?.slug).toBe('electronics');
    expect(home.categories[0]?.productCount).toBe(1);
    expect(home.featuredProducts[0]?.slug).toBe('featured-laptop');
  });
});
