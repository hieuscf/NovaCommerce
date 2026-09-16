import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCartLineCount, getCartPage, getCartPageFromFixtures } from '../get-cart-page';
import { mapCartItemToLine, mapCartToPageViewModel } from '../mappers';
import type { CartDto, CartItemDto } from '../types';
import type { ProductDto } from '@/lib/catalog/types';

const getCart = vi.fn();
const getAccount = vi.fn();
const createProfile = vi.fn();
const getProductById = vi.fn();
const listCategories = vi.fn();
const listProducts = vi.fn();

vi.mock('../client', () => ({
  cartClient: {
    getCart: (...args: unknown[]) => getCart(...args),
    addItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
}));

vi.mock('@/lib/user/client', () => ({
  userClient: {
    getAccount: (...args: unknown[]) => getAccount(...args),
    createProfile: (...args: unknown[]) => createProfile(...args),
  },
}));

vi.mock('@/lib/catalog/client', () => ({
  catalogClient: {
    getProductById: (...args: unknown[]) => getProductById(...args),
    listCategories: (...args: unknown[]) => listCategories(...args),
    listProducts: (...args: unknown[]) => listProducts(...args),
    getProductBySlug: vi.fn(),
    getCategoryById: vi.fn(),
  },
}));

const sampleItem: CartItemDto = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  productId: '55555555-5555-5555-5555-555555550001',
  quantity: 2,
  unitPriceAmount: 799,
  unitPriceCurrency: 'USD',
  lineTotalAmount: 1598,
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
};

const sampleCart: CartDto = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  customerId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  items: [sampleItem],
  itemCount: 2,
  subtotalAmount: 1598,
  currency: 'USD',
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
};

const sampleProduct: ProductDto = {
  id: '55555555-5555-5555-5555-555555550001',
  name: 'Nova Phone X',
  slug: 'nova-phone-x',
  basePriceAmount: 799,
  basePriceCurrency: 'USD',
  status: 'published',
  variants: [
    {
      id: 'v1',
      sku: 'NPX',
      priceAmount: 799,
      priceCurrency: 'USD',
      attributes: { Color: 'Titanium', Storage: '256GB' },
      createdAt: '2026-09-16T00:00:00.000Z',
      updatedAt: '2026-09-16T00:00:00.000Z',
    },
  ],
  images: [
    {
      id: 'i1',
      url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop',
      sortOrder: 0,
      createdAt: '2026-09-16T00:00:00.000Z',
      updatedAt: '2026-09-16T00:00:00.000Z',
    },
  ],
  attributes: [],
  options: [],
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
};

describe('cart mappers', () => {
  it('maps cart items onto line view-models with catalog merchandising', () => {
    const line = mapCartItemToLine(sampleItem, sampleProduct);

    expect(line).toMatchObject({
      id: sampleItem.id,
      productId: sampleItem.productId,
      name: 'Nova Phone X',
      slug: 'nova-phone-x',
      unitPrice: 799,
      quantity: 2,
      variantLabel: 'Titanium · 256GB',
      selected: true,
    });
  });

  it('builds a cart page view-model from a Gateway cart DTO', () => {
    const page = mapCartToPageViewModel(
      sampleCart,
      new Map([[sampleProduct.id, sampleProduct]]),
      new Map(),
      [],
    );

    expect(page.lines).toHaveLength(1);
    expect(page.summary.subtotal).toBe(1598);
    expect(page.crumbs.at(-1)?.label).toBe('Cart');
  });
});

describe('getCartPageFromFixtures', () => {
  it('joins catalog merchandising onto fixture lines', () => {
    const page = getCartPageFromFixtures();

    expect(page.lines).toHaveLength(3);
    expect(page.lines[0]).toMatchObject({
      name: 'MacBook Air M2 13"',
      variantLabel: 'Space Gray · 256GB · 8GB',
      unitPrice: 999,
      quantity: 1,
      inStock: true,
      selected: true,
      slug: 'macbook-air-m2',
    });
    expect(page.summary.subtotal).toBe(1986);
    expect(page.summary.total).toBe(2144.88);
    expect(page.recommendations.length).toBe(5);
  });

  it('returns an empty cart when there are no fixture lines', () => {
    const page = getCartPageFromFixtures([]);

    expect(page.lines).toEqual([]);
    expect(page.summary.itemCount).toBe(0);
    expect(page.summary.total).toBe(0);
    expect(page.recommendations.length).toBeGreaterThan(0);
  });

  it('counts fixture lines for the header badge', () => {
    expect(getCartLineCount()).toBe(3);
  });
});

describe('getCartPage', () => {
  beforeEach(() => {
    getCart.mockReset();
    getAccount.mockReset();
    createProfile.mockReset();
    getProductById.mockReset();
    listCategories.mockReset();
    listProducts.mockReset();

    getAccount.mockResolvedValue({ userId: 'u1' });
    getCart.mockResolvedValue(sampleCart);
    getProductById.mockResolvedValue(sampleProduct);
    listCategories.mockResolvedValue([]);
    listProducts.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 100 });
  });

  it('loads the authenticated cart from Gateway and joins catalog products', async () => {
    const page = await getCartPage();

    expect(getCart).toHaveBeenCalledOnce();
    expect(getProductById).toHaveBeenCalledWith(sampleItem.productId);
    expect(page.lines[0]?.name).toBe('Nova Phone X');
    expect(page.lines[0]?.quantity).toBe(2);
    expect(page.summary.subtotal).toBe(1598);
  });
});
