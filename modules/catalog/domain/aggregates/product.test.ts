import { describe, expect, it } from 'vitest';
import { ProductVariant } from '../entities/product-variant';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductPriceChangedEvent } from '../events/product-price-changed.event';
import { ProductPublishedEvent } from '../events/product-published.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import { Money } from '../value-objects/money';
import { ProductName } from '../value-objects/product-name';
import { ProductSku } from '../value-objects/product-sku';
import { ProductSlug } from '../value-objects/product-slug';
import { Product, ProductStatus } from './product';

describe('Product aggregate', () => {
  const productId = '11111111-1111-1111-1111-111111111111';

  function createProduct() {
    return Product.create(
      productId,
      ProductName.create('Nova Headphones'),
      ProductSlug.create('nova-headphones'),
      Money.create(99.99, 'USD'),
    ).getValue();
  }

  it('creates product with ProductCreated event', () => {
    const product = createProduct();
    const events = product.pullDomainEvents();

    expect(product.getStatus()).toBe(ProductStatus.DRAFT);
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ProductCreatedEvent);
  });

  it('publishes product and emits ProductPublished', () => {
    const product = createProduct();
    product.pullDomainEvents();

    const result = product.publish();
    expect(result.isSuccess).toBe(true);
    expect(product.getStatus()).toBe(ProductStatus.PUBLISHED);

    const events = product.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ProductPublishedEvent);
  });

  it('rejects publishing archived product', () => {
    const product = createProduct();
    product.publish();
    product.archive();

    const result = product.publish();
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PRODUCT_ARCHIVED');
  });

  it('changes price and emits ProductPriceChanged and ProductUpdated', () => {
    const product = createProduct();
    product.pullDomainEvents();

    const result = product.changePrice(Money.create(129.99, 'USD'));
    expect(result.isSuccess).toBe(true);

    const events = product.pullDomainEvents();
    expect(events.some((event) => event instanceof ProductPriceChangedEvent)).toBe(true);
    expect(events.some((event) => event instanceof ProductUpdatedEvent)).toBe(true);
  });

  it('updates details and emits ProductUpdated', () => {
    const product = createProduct();
    product.pullDomainEvents();

    const result = product.updateDetails({
      name: ProductName.create('Nova Headphones Pro'),
    });
    expect(result.isSuccess).toBe(true);

    const events = product.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ProductUpdatedEvent);
  });

  it('rejects duplicate variant sku', () => {
    const product = createProduct();
    const variant = ProductVariant.create(
      'variant-1',
      ProductSku.create('SKU-001'),
      Money.create(99.99, 'USD'),
    );

    product.addVariant(variant);
    const duplicateResult = product.addVariant(
      ProductVariant.create('variant-2', ProductSku.create('SKU-001'), Money.create(99.99, 'USD')),
    );

    expect(duplicateResult.isFailure).toBe(true);
    expect(duplicateResult.getError().code).toBe('DUPLICATE_VARIANT_SKU');
  });

  it('archives product and emits ProductUpdated', () => {
    const product = createProduct();
    product.pullDomainEvents();

    const result = product.archive();
    expect(result.isSuccess).toBe(true);
    expect(product.getStatus()).toBe(ProductStatus.ARCHIVED);

    const events = product.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(ProductUpdatedEvent);
  });
});
