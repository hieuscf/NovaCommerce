import { describe, expect, it, vi } from 'vitest';
import { Product } from '../../domain/aggregates/product';
import { Money } from '../../domain/value-objects/money';
import { ProductName } from '../../domain/value-objects/product-name';
import { ProductSlug } from '../../domain/value-objects/product-slug';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import { PublishProductHandler } from './publish-product.handler';

describe('PublishProductHandler', () => {
  it('publishes existing product', async () => {
    const product = Product.create(
      '11111111-1111-1111-1111-111111111111',
      ProductName.create('Nova Headphones'),
      ProductSlug.create('nova-headphones'),
      Money.create(99.99, 'USD'),
    ).getValue();

    const repository: IProductRepository = {
      findById: vi.fn().mockResolvedValue(product),
      findBySlug: vi.fn(),
      existsBySlug: vi.fn(),
      list: vi.fn(),
      save: vi.fn(),
    };

    const handler = new PublishProductHandler(repository);
    const result = await handler.execute({ productId: product.id });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('published');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('returns not found when product missing', async () => {
    const repository: IProductRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findBySlug: vi.fn(),
      existsBySlug: vi.fn(),
      list: vi.fn(),
      save: vi.fn(),
    };

    const handler = new PublishProductHandler(repository);
    const result = await handler.execute({ productId: 'missing-id' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PRODUCT_NOT_FOUND');
  });
});
