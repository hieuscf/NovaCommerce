import { describe, expect, it, vi } from 'vitest';
import { Result } from '@novacommerce/building-blocks';
import { Cart } from '../../../cart/domain/aggregates/cart';
import { CartItem } from '../../../cart/domain/entities/cart-item';
import { CartId } from '../../../cart/domain/value-objects/cart-id';
import { Money } from '../../../cart/domain/value-objects/money';
import { ProductReference } from '../../../cart/domain/value-objects/product-reference';
import { Quantity } from '../../../cart/domain/value-objects/quantity';
import { InventoryItem } from '../../../inventory/domain/aggregates/inventory-item';
import { Quantity as InventoryQuantity } from '../../../inventory/domain/value-objects/quantity';
import { Sku } from '../../../inventory/domain/value-objects/sku';
import { WarehouseId } from '../../../inventory/domain/value-objects/warehouse-id';
import { Product } from '../../../catalog/domain/aggregates/product';
import { ProductVariant } from '../../../catalog/domain/entities/product-variant';
import { ProductName } from '../../../catalog/domain/value-objects/product-name';
import { ProductSku } from '../../../catalog/domain/value-objects/product-sku';
import { ProductSlug } from '../../../catalog/domain/value-objects/product-slug';
import { User } from '../../../user/domain/aggregates/user';
import { UserAddress } from '../../../user/domain/entities/user-address';
import { UserProfile } from '../../../user/domain/entities/user-profile';
import { Address } from '../../../user/domain/value-objects/address';
import { DisplayName } from '../../../user/domain/value-objects/display-name';
import { UserId } from '../../../user/domain/value-objects/user-id';
import { StartCheckoutHandler } from './start-checkout.handler';

function createUserWithAddress() {
  const user = User.create(
    UserId.create('user-1'),
    'identity-1',
    UserProfile.create('profile-1', DisplayName.create('Test User')),
  ).getValue();

  user.addAddress(
    UserAddress.create(
      'address-1',
      'Home',
      Address.create({
        line1: '123 Main St',
        city: 'Ho Chi Minh City',
        state: 'SG',
        postalCode: '700000',
        country: 'VN',
      }),
      true,
    ),
  );

  return user;
}

function createProductWithVariant() {
  const product = Product.create(
    'product-1',
    ProductName.create('Test Product'),
    ProductSlug.create('test-product'),
    Money.create(100, 'USD'),
  ).getValue();

  product.addVariant(
    ProductVariant.create('variant-1', ProductSku.create('SKU-001'), Money.create(100, 'USD')),
  );

  return product;
}

describe('StartCheckoutHandler', () => {
  it('starts checkout for a valid cart', async () => {
    const user = createUserWithAddress();
    const cart = Cart.create(CartId.create('cart-1'), user.id).getValue();
    cart.addItem(
      CartItem.create(
        'item-1',
        ProductReference.create('product-1', 'variant-1'),
        Quantity.create(1),
        Money.create(100, 'USD'),
      ),
    );

    const inventoryItem = InventoryItem.create(
      'inventory-1',
      Sku.create('SKU-001'),
      WarehouseId.create('warehouse-1'),
      InventoryQuantity.create(10),
    ).getValue();

    const handler = new StartCheckoutHandler(
      { findByIdentityId: vi.fn().mockResolvedValue(user), findById: vi.fn(), save: vi.fn() },
      { findByCustomerId: vi.fn().mockResolvedValue(cart), findById: vi.fn(), save: vi.fn() },
      { findById: vi.fn().mockResolvedValue(createProductWithVariant()), findBySlug: vi.fn(), existsBySlug: vi.fn(), list: vi.fn(), save: vi.fn() },
      {
        findBySkuAndWarehouse: vi.fn().mockResolvedValue(inventoryItem),
        findById: vi.fn(),
        findWithActiveReservationsForOrder: vi.fn(),
        save: vi.fn(),
      },
      { evaluate: vi.fn().mockResolvedValue(Result.ok(null)) },
      { findById: vi.fn(), save: vi.fn().mockResolvedValue(undefined) },
    );

    const result = await handler.execute({
      identityId: 'identity-1',
      warehouseId: 'warehouse-1',
      shippingAddressId: 'address-1',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().lines).toHaveLength(1);
    expect(result.getValue().totalAmount).toBe(100);
  });

  it('fails when cart is empty', async () => {
    const user = createUserWithAddress();
    const handler = new StartCheckoutHandler(
      { findByIdentityId: vi.fn().mockResolvedValue(user), findById: vi.fn(), save: vi.fn() },
      { findByCustomerId: vi.fn().mockResolvedValue(null), findById: vi.fn(), save: vi.fn() },
      { findById: vi.fn(), findBySlug: vi.fn(), existsBySlug: vi.fn(), list: vi.fn(), save: vi.fn() },
      { findBySkuAndWarehouse: vi.fn(), findById: vi.fn(), findWithActiveReservationsForOrder: vi.fn(), save: vi.fn() },
      { evaluate: vi.fn() },
      { findById: vi.fn(), save: vi.fn() },
    );

    const result = await handler.execute({
      identityId: 'identity-1',
      warehouseId: 'warehouse-1',
      shippingAddressId: 'address-1',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('CART_EMPTY');
  });
});
