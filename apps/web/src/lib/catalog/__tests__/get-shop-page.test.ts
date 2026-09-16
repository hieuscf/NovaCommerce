import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getShopPageModel } from '../get-shop-page';
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

const categories: CategoryDto[] = [
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
];

const phone: ProductDto = {
  id: 'prod-phone',
  name: 'Nova Phone X',
  slug: 'nova-phone-x',
  basePriceAmount: 799,
  basePriceCurrency: 'USD',
  status: 'published',
  categoryId: 'cat-phones',
  variants: [],
  images: [],
  attributes: [
    {
      id: 'a1',
      name: 'Brand',
      value: 'Nova',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ],
  options: [],
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('getShopPageModel', () => {
  beforeEach(() => {
    listCategories.mockReset();
    listProducts.mockReset();
    listCategories.mockResolvedValue(categories);
    listProducts.mockResolvedValue({
      items: [phone],
      total: 1,
      page: 1,
      pageSize: 100,
    } satisfies ProductListDto);
  });

  it('loads a collection route from Gateway published products', async () => {
    const model = await getShopPageModel({}, 'electronics');

    expect(listProducts).toHaveBeenCalledWith({
      status: 'published',
      page: 1,
      pageSize: 100,
    });
    expect(model).not.toBeNull();
    expect(model?.query.collection).toBe('electronics');
    expect(model?.header.title).toBe('Electronics');
    expect(model?.total).toBe(1);
    expect(model?.products[0]?.slug).toBe('nova-phone-x');
  });

  it('returns null for an unknown collection slug', async () => {
    await expect(getShopPageModel({}, 'not-a-collection')).resolves.toBeNull();
    expect(listProducts).not.toHaveBeenCalled();
  });
});
