import { describe, expect, it, vi } from 'vitest';
import { Result } from '@novacommerce/building-blocks';
import { CheckoutSession } from '../../domain/aggregates/checkout-session';
import { CheckoutLine } from '../../domain/entities/checkout-line';
import { User } from '../../../user/domain/aggregates/user';
import { UserAddress } from '../../../user/domain/entities/user-address';
import { UserProfile } from '../../../user/domain/entities/user-profile';
import { Address } from '../../../user/domain/value-objects/address';
import { DisplayName } from '../../../user/domain/value-objects/display-name';
import { UserId } from '../../../user/domain/value-objects/user-id';
import { Product } from '../../../catalog/domain/aggregates/product';
import { ProductVariant } from '../../../catalog/domain/entities/product-variant';
import { ProductName } from '../../../catalog/domain/value-objects/product-name';
import { ProductSku } from '../../../catalog/domain/value-objects/product-sku';
import { ProductSlug } from '../../../catalog/domain/value-objects/product-slug';
import { Money } from '../../../catalog/domain/value-objects/money';
import { CompleteCheckoutHandler } from './complete-checkout.handler';

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

function createSession() {
  const session = CheckoutSession.start('session-1', 'cart-1', 'user-1').getValue();
  session.addLine(CheckoutLine.create('line-1', 'product-1', 1, 100, 'USD', 'variant-1'));
  return session;
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

describe('CompleteCheckoutHandler', () => {
  it('completes checkout and initiates payment', async () => {
    const user = createUserWithAddress();
    const session = createSession();

    process.env.VNPAY_REDIRECT_BASE_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    const handler = new CompleteCheckoutHandler(
      { findByIdentityId: vi.fn().mockResolvedValue(user), findById: vi.fn(), save: vi.fn() },
      { findById: vi.fn().mockResolvedValue(createProductWithVariant()), findBySlug: vi.fn(), existsBySlug: vi.fn(), list: vi.fn(), save: vi.fn() },
      { findById: vi.fn().mockResolvedValue(session), save: vi.fn().mockResolvedValue(undefined) },
      {
        execute: vi.fn().mockResolvedValue(
          Result.ok({ orderId: 'order-1', orderNumber: 'ORD-12345678' }),
        ),
      },
      {
        initiate: vi.fn().mockResolvedValue(
          Result.ok({
            paymentId: 'payment-1',
            provider: 'vnpay',
            redirectUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?orderId=order-1',
          }),
        ),
      },
    );

    const result = await handler.execute({
      identityId: 'identity-1',
      sessionId: 'session-1',
      warehouseId: 'warehouse-1',
      shippingAddressId: 'address-1',
      paymentProvider: 'vnpay',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().orderId).toBe('order-1');
    expect(result.getValue().payment.provider).toBe('vnpay');

    delete process.env.VNPAY_REDIRECT_BASE_URL;
  });

  it('rejects unsupported payment provider', async () => {
    const handler = new CompleteCheckoutHandler(
      { findByIdentityId: vi.fn(), findById: vi.fn(), save: vi.fn() },
      { findById: vi.fn(), findBySlug: vi.fn(), existsBySlug: vi.fn(), list: vi.fn(), save: vi.fn() },
      { findById: vi.fn(), save: vi.fn() },
      { execute: vi.fn() },
      { initiate: vi.fn() },
    );

    const result = await handler.execute({
      identityId: 'identity-1',
      sessionId: 'session-1',
      warehouseId: 'warehouse-1',
      shippingAddressId: 'address-1',
      paymentProvider: 'stripe',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_PAYMENT_PROVIDER');
  });
});
