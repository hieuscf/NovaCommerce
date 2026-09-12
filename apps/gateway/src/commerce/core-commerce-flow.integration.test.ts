import { randomUUID } from 'node:crypto';
import {
  InMemoryEventBus,
  OutboxPublisher,
} from '@novacommerce/building-blocks';
import { PrismaClient, PrismaOutboxRepository } from '@novacommerce/database';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AddCartItemHandler } from '../../../../modules/cart/application/handlers/add-cart-item.handler';
import { PrismaOutboxStore as CartOutboxStore } from '../../../../modules/cart/infrastructure/prisma/prisma-outbox-store';
import { PrismaCartRepository } from '../../../../modules/cart/infrastructure/repositories/prisma-cart-repository';
import { CreateProductHandler } from '../../../../modules/catalog/application/handlers/create-product.handler';
import { ProductVariant } from '../../../../modules/catalog/domain/entities/product-variant';
import { Money as CatalogMoney } from '../../../../modules/catalog/domain/value-objects/money';
import { ProductSku } from '../../../../modules/catalog/domain/value-objects/product-sku';
import { PrismaOutboxStore as CatalogOutboxStore } from '../../../../modules/catalog/infrastructure/prisma/prisma-outbox-store';
import { PrismaProductRepository } from '../../../../modules/catalog/infrastructure/repositories/prisma-product-repository';
import { CompleteCheckoutHandler } from '../../../../modules/checkout/application/handlers/complete-checkout.handler';
import { StartCheckoutHandler } from '../../../../modules/checkout/application/handlers/start-checkout.handler';
import { PrismaOutboxStore as CheckoutOutboxStore } from '../../../../modules/checkout/infrastructure/prisma/prisma-outbox-store';
import { PrismaCheckoutSessionRepository } from '../../../../modules/checkout/infrastructure/repositories/prisma-checkout-session-repository';
import { CreateInventoryItemHandler } from '../../../../modules/inventory/application/handlers/create-inventory-item.handler';
import { OrderCreatedHandler } from '../../../../modules/inventory/application/handlers/order-created.handler';
import { ReserveStockHandler } from '../../../../modules/inventory/application/handlers/reserve-stock.handler';
import { registerInventoryEventHandlers } from '../../../../modules/inventory/application/register-inventory-event-handlers';
import { PrismaOutboxStore as InventoryOutboxStore } from '../../../../modules/inventory/infrastructure/prisma/prisma-outbox-store';
import { PrismaInventoryItemRepository } from '../../../../modules/inventory/infrastructure/repositories/prisma-inventory-item-repository';
import { RegisterIdentityHandler } from '../../../../modules/identity/application/handlers/register-identity.handler';
import { PrismaOutboxStore as IdentityOutboxStore } from '../../../../modules/identity/infrastructure/prisma/prisma-outbox-store';
import { PrismaIdentityRepository } from '../../../../modules/identity/infrastructure/repositories/prisma-identity-repository';
import { BcryptPasswordHasher } from '../../../../modules/identity/infrastructure/services/bcrypt-password-hasher';
import { PrismaAuditLogger } from '../../../../modules/identity/infrastructure/services/prisma-audit-logger';
import { CreateOrderFromCheckoutHandler } from '../../../../modules/order/application/handlers/create-order-from-checkout.handler';
import { PrismaOutboxStore as OrderOutboxStore } from '../../../../modules/order/infrastructure/prisma/prisma-outbox-store';
import { PrismaOrderRepository } from '../../../../modules/order/infrastructure/repositories/prisma-order-repository';
import { StubPaymentInitiationService } from '../../../../modules/payment/infrastructure/services/stub-payment-initiation.service';
import { EvaluatePromotionService } from '../../../../modules/promotion/application/services/evaluate-promotion.service';
import { PrismaCouponRepository } from '../../../../modules/promotion/infrastructure/repositories/prisma-coupon-repository';
import { PrismaPromotionRepository } from '../../../../modules/promotion/infrastructure/repositories/prisma-promotion-repository';
import { AddAddressHandler } from '../../../../modules/user/application/handlers/add-address.handler';
import { CreateCustomerProfileHandler } from '../../../../modules/user/application/handlers/create-customer-profile.handler';
import { PrismaOutboxStore as UserOutboxStore } from '../../../../modules/user/infrastructure/prisma/prisma-outbox-store';
import { PrismaUserRepository } from '../../../../modules/user/infrastructure/repositories/prisma-user-repository';
import { resetDatabase } from '../../../../packages/database/src/test/database-test-utils';

function createIntegrationPrismaClient(): PrismaClient {
  const databaseUrl = process.env.INTEGRATION_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('INTEGRATION_DATABASE_URL is required for Core Commerce integration tests');
  }

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });
}

const describeIfDatabase = process.env.INTEGRATION_DATABASE_URL ? describe : describe.skip;

describeIfDatabase('Core Commerce Flow (integration)', () => {
  let prisma: PrismaClient;
  let eventBus: InMemoryEventBus;
  let outboxPublisher: OutboxPublisher;

  const warehouseId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const sku = 'NOVA-FLOW-001';

  beforeAll(() => {
    process.env.VNPAY_REDIRECT_BASE_URL =
      process.env.VNPAY_REDIRECT_BASE_URL ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    prisma = createIntegrationPrismaClient();
    eventBus = new InMemoryEventBus();

    const inventoryRepository = new PrismaInventoryItemRepository(
      prisma,
      new InventoryOutboxStore(prisma),
    );
    const reserveStockHandler = new ReserveStockHandler(inventoryRepository);
    registerInventoryEventHandlers(eventBus, new OrderCreatedHandler(reserveStockHandler));

    outboxPublisher = new OutboxPublisher(new PrismaOutboxRepository(prisma), eventBus);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('runs register → product → cart → checkout → order → inventory reservation → outbox', async () => {
    const identityRepository = new PrismaIdentityRepository(prisma, new IdentityOutboxStore(prisma));
    const userRepository = new PrismaUserRepository(prisma, new UserOutboxStore(prisma));
    const productRepository = new PrismaProductRepository(prisma, new CatalogOutboxStore(prisma));
    const inventoryRepository = new PrismaInventoryItemRepository(
      prisma,
      new InventoryOutboxStore(prisma),
    );
    const cartRepository = new PrismaCartRepository(prisma, new CartOutboxStore(prisma));
    const checkoutSessionRepository = new PrismaCheckoutSessionRepository(
      prisma,
      new CheckoutOutboxStore(prisma),
    );
    const orderRepository = new PrismaOrderRepository(prisma, new OrderOutboxStore(prisma));

    const registerIdentityHandler = new RegisterIdentityHandler(
      identityRepository,
      new BcryptPasswordHasher(),
      new PrismaAuditLogger(prisma),
    );
    const createCustomerProfileHandler = new CreateCustomerProfileHandler(userRepository);
    const addAddressHandler = new AddAddressHandler(userRepository);
    const createProductHandler = new CreateProductHandler(productRepository);
    const createInventoryItemHandler = new CreateInventoryItemHandler(inventoryRepository);
    const addCartItemHandler = new AddCartItemHandler(userRepository, cartRepository);
    const promotionEvaluationService = new EvaluatePromotionService(
      new PrismaCouponRepository(prisma),
      new PrismaPromotionRepository(prisma),
    );
    const startCheckoutHandler = new StartCheckoutHandler(
      userRepository,
      cartRepository,
      productRepository,
      inventoryRepository,
      promotionEvaluationService,
      checkoutSessionRepository,
    );
    const completeCheckoutHandler = new CompleteCheckoutHandler(
      userRepository,
      productRepository,
      checkoutSessionRepository,
      new CreateOrderFromCheckoutHandler(orderRepository),
      new StubPaymentInitiationService(),
    );

    const email = `customer-${randomUUID()}@novacommerce.test`;
    const registerResult = await registerIdentityHandler.execute({
      email,
      password: 'SecurePass123!',
    });
    expect(registerResult.isSuccess).toBe(true);
    const identityId = registerResult.getValue().identityId;

    const profileResult = await createCustomerProfileHandler.execute({
      identityId,
      displayName: 'Core Commerce Customer',
    });
    expect(profileResult.isSuccess).toBe(true);

    const addressResult = await addAddressHandler.execute({
      identityId,
      label: 'Home',
      line1: '123 Commerce Street',
      city: 'Ho Chi Minh City',
      state: 'SG',
      postalCode: '700000',
      country: 'VN',
      isDefault: true,
    });
    expect(addressResult.isSuccess).toBe(true);
    const shippingAddressId = addressResult.getValue().id;

    const productSlug = `core-flow-product-${randomUUID().slice(0, 8)}`;
    const createProductResult = await createProductHandler.execute({
      name: 'Core Flow Product',
      slug: productSlug,
      basePriceAmount: 4999,
      basePriceCurrency: 'USD',
    });
    expect(createProductResult.isSuccess).toBe(true);
    const productId = createProductResult.getValue().id;

    const product = await productRepository.findById(productId);
    expect(product).not.toBeNull();
    const variantId = randomUUID();
    const addVariantResult = product!.addVariant(
      ProductVariant.create(variantId, ProductSku.create(sku), CatalogMoney.create(4999, 'USD')),
    );
    expect(addVariantResult.isSuccess).toBe(true);
    await productRepository.save(product!);

    const inventoryResult = await createInventoryItemHandler.execute({
      sku,
      warehouseId,
      onHand: 25,
    });
    expect(inventoryResult.isSuccess).toBe(true);

    const cartResult = await addCartItemHandler.execute({
      identityId,
      productId,
      variantId,
      quantity: 2,
      unitPriceAmount: 4999,
      unitPriceCurrency: 'USD',
    });
    expect(cartResult.isSuccess).toBe(true);

    const startCheckoutResult = await startCheckoutHandler.execute({
      identityId,
      warehouseId,
      shippingAddressId,
    });
    expect(startCheckoutResult.isSuccess).toBe(true);
    const sessionId = startCheckoutResult.getValue().id;

    const completeCheckoutResult = await completeCheckoutHandler.execute({
      identityId,
      sessionId,
      warehouseId,
      shippingAddressId,
      paymentProvider: 'vnpay',
    });
    expect(completeCheckoutResult.isSuccess).toBe(true);
    const orderId = completeCheckoutResult.getValue().orderId;

    const orderCreatedOutbox = await prisma.outboxMessage.findMany({
      where: { aggregateType: 'Order', eventType: 'OrderCreated', processedAt: null },
    });
    expect(orderCreatedOutbox.length).toBeGreaterThan(0);

    await outboxPublisher.processBatch();

    const processedOrderCreated = await prisma.outboxMessage.findMany({
      where: { aggregateType: 'Order', eventType: 'OrderCreated' },
    });
    expect(processedOrderCreated.every((message) => message.processedAt !== null)).toBe(true);

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { sku, warehouseId },
      include: { reservations: true },
    });
    expect(inventoryItem?.reserved).toBe(2);
    expect(inventoryItem?.reservations.some((reservation) => reservation.orderId === orderId)).toBe(true);

    const stockReservedOutbox = await prisma.outboxMessage.findMany({
      where: { eventType: 'StockReserved', aggregateType: 'InventoryItem' },
    });
    expect(stockReservedOutbox.length).toBeGreaterThan(0);

    await outboxPublisher.processBatch();

    const processedStockReserved = await prisma.outboxMessage.findMany({
      where: { eventType: 'StockReserved' },
    });
    expect(processedStockReserved.every((message) => message.processedAt !== null)).toBe(true);
  });
});
