import { describe, expect, it, vi } from 'vitest';
import type { IProductRepository } from '../../domain/repositories/i-product-repository';
import { CreateProductHandler } from './create-product.handler';

describe('CreateProductHandler', () => {
  it('creates product when slug is unique', async () => {
    const repository: IProductRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      existsBySlug: vi.fn().mockResolvedValue(false),
      list: vi.fn(),
      save: vi.fn(),
    };

    const handler = new CreateProductHandler(repository);
    const result = await handler.execute({
      name: 'Nova Headphones',
      slug: 'nova-headphones',
      basePriceAmount: 99.99,
      basePriceCurrency: 'USD',
    });

    expect(result.isSuccess).toBe(true);
    expect(repository.save).toHaveBeenCalledOnce();
    expect(result.getValue().slug).toBe('nova-headphones');
  });

  it('returns duplicate slug error', async () => {
    const repository: IProductRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      existsBySlug: vi.fn().mockResolvedValue(true),
      list: vi.fn(),
      save: vi.fn(),
    };

    const handler = new CreateProductHandler(repository);
    const result = await handler.execute({
      name: 'Nova Headphones',
      slug: 'nova-headphones',
      basePriceAmount: 99.99,
      basePriceCurrency: 'USD',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('DUPLICATE_SLUG');
  });
});
