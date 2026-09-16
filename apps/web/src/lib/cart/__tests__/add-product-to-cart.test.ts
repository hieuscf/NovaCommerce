import { describe, expect, it, vi, beforeEach } from 'vitest';
import { addProductToCart } from '../add-product-to-cart';
import { resetAuthSession, signIn } from '@/lib/auth/session';

const addItem = vi.fn();
const getAccount = vi.fn();
const createProfile = vi.fn();

vi.mock('../client', () => ({
  cartClient: {
    addItem: (...args: unknown[]) => addItem(...args),
    getCart: vi.fn(),
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

describe('addProductToCart', () => {
  beforeEach(() => {
    addItem.mockReset();
    getAccount.mockReset();
    createProfile.mockReset();
    resetAuthSession();
    getAccount.mockResolvedValue({ userId: 'u1' });
    addItem.mockResolvedValue({ id: 'cart', items: [] });
  });

  it('requires login when the session is unauthenticated', async () => {
    const result = await addProductToCart({
      productId: '55555555-5555-5555-5555-555555550001',
      unitPriceAmount: 99,
      unitPriceCurrency: 'USD',
    });

    expect(result).toEqual({ status: 'login_required' });
    expect(addItem).not.toHaveBeenCalled();
  });

  it('rejects fixture product ids that are not Gateway UUIDs', async () => {
    signIn({ accessToken: 'token', tokenType: 'Bearer', expiresIn: 3600 });

    const result = await addProductToCart({
      productId: 'p-macbook-air',
      unitPriceAmount: 999,
      unitPriceCurrency: 'USD',
    });

    expect(result).toEqual({ status: 'unsupported_product' });
    expect(addItem).not.toHaveBeenCalled();
  });

  it('posts to Gateway cart when authenticated with a live product id', async () => {
    signIn({ accessToken: 'token', tokenType: 'Bearer', expiresIn: 3600 });

    const result = await addProductToCart({
      productId: '55555555-5555-5555-5555-555555550001',
      unitPriceAmount: 799,
      unitPriceCurrency: 'USD',
      quantity: 2,
    });

    expect(result).toEqual({ status: 'added' });
    expect(addItem).toHaveBeenCalledWith({
      productId: '55555555-5555-5555-5555-555555550001',
      variantId: undefined,
      quantity: 2,
      unitPriceAmount: 799,
      unitPriceCurrency: 'USD',
    });
  });
});
