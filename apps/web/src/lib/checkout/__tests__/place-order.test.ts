import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@novacommerce/frontend';
import { placeCheckoutOrder, resolveShippingAddressId } from '../place-order';
import type { CheckoutFormValues } from '@/lib/validation/checkout-schemas';

const { startCheckout, completeCheckout, getAccount, createProfile, getAddresses, addAddress, updateAddress } =
  vi.hoisted(() => ({
    startCheckout: vi.fn(),
    completeCheckout: vi.fn(),
    getAccount: vi.fn(),
    createProfile: vi.fn(),
    getAddresses: vi.fn(),
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
  }));

vi.mock('@/lib/checkout/client', () => ({
  checkoutClient: {
    startCheckout,
    completeCheckout,
  },
}));

vi.mock('@/lib/user/client', () => ({
  userClient: {
    getAccount,
    createProfile,
    getAddresses,
    addAddress,
    updateAddress,
  },
}));

const values: CheckoutFormValues = {
  fullName: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+84 912 345 678',
  createAccount: false,
  addressLine1: '123 Tech Street',
  addressLine2: '',
  city: 'Ho Chi Minh City',
  state: 'HCM',
  postalCode: '700000',
  country: 'VN',
  paymentMethod: 'card',
  cardNumber: '4111111111111111',
  cardholderName: 'Alex Johnson',
  cardExpiration: '12/29',
  cardCvv: '123',
  otpCode: '123456',
};

describe('resolveShippingAddressId', () => {
  beforeEach(() => {
    getAccount.mockReset();
    createProfile.mockReset();
    getAddresses.mockReset();
    addAddress.mockReset();
    updateAddress.mockReset();
    getAccount.mockResolvedValue({ userId: 'user-1' });
  });

  it('creates a profile when missing, then adds a shipping address', async () => {
    getAccount.mockRejectedValueOnce(
      new ApiClientError({ category: 'not_found', status: 404, code: 'NOT_FOUND', message: 'missing' }),
    );
    createProfile.mockResolvedValue({ displayName: 'Alex Johnson' });
    getAddresses.mockResolvedValue([]);
    addAddress.mockResolvedValue({ id: 'addr-new' });

    await expect(resolveShippingAddressId(values)).resolves.toBe('addr-new');
    expect(createProfile).toHaveBeenCalledWith({
      displayName: 'Alex Johnson',
      phoneNumber: '+84 912 345 678',
    });
    expect(addAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Shipping',
        line1: '123 Tech Street',
        country: 'VN',
        isDefault: true,
      }),
    );
  });

  it('updates the default address when one already exists', async () => {
    getAddresses.mockResolvedValue([{ id: 'addr-1', isDefault: true }]);
    updateAddress.mockResolvedValue({ id: 'addr-1' });

    await expect(resolveShippingAddressId(values)).resolves.toBe('addr-1');
    expect(updateAddress).toHaveBeenCalledWith('addr-1', expect.objectContaining({ line1: '123 Tech Street' }));
    expect(addAddress).not.toHaveBeenCalled();
  });
});

describe('placeCheckoutOrder', () => {
  beforeEach(() => {
    getAccount.mockReset();
    getAddresses.mockReset();
    updateAddress.mockReset();
    startCheckout.mockReset();
    completeCheckout.mockReset();
    getAccount.mockResolvedValue({ userId: 'user-1' });
    getAddresses.mockResolvedValue([{ id: 'addr-1', isDefault: true }]);
    updateAddress.mockResolvedValue({ id: 'addr-1' });
    startCheckout.mockResolvedValue({ id: 'session-1' });
    completeCheckout.mockResolvedValue({
      orderId: 'order-1',
      orderNumber: 'ORD-ABCDEF12',
    });
  });

  it('starts and completes checkout with mapped payment provider', async () => {
    const result = await placeCheckoutOrder({ values, paymentMethod: 'card' });

    expect(startCheckout).toHaveBeenCalledWith({
      warehouseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      shippingAddressId: 'addr-1',
    });
    expect(completeCheckout).toHaveBeenCalledWith('session-1', {
      warehouseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      shippingAddressId: 'addr-1',
      paymentProvider: 'vnpay',
    });
    expect(result.orderNumber).toBe('ORD-ABCDEF12');
  });
});
