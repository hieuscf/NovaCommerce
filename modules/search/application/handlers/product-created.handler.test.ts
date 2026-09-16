import { describe, expect, it, vi } from 'vitest';
import type { ILogger, IntegrationEvent } from '@novacommerce/building-blocks';
import { ProductCreatedHandler } from './product-created.handler';
import type { ProductIndexer } from '../services/product-indexer';

function createLogger(): ILogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function createdEvent(payload: Record<string, unknown>): IntegrationEvent {
  return {
    eventId: 'evt-created-1',
    eventType: 'catalog.product_created',
    eventVersion: 1,
    aggregateId: '11111111-1111-1111-1111-111111111111',
    aggregateType: 'Product',
    occurredAt: '2026-01-01T00:00:00.000Z',
    payload,
  };
}

const validPayload = {
  name: 'Nova Headphones',
  slug: 'nova-headphones',
  status: 'draft',
  price: 99.99,
  currency: 'USD',
  images: [],
  attributes: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ProductCreatedHandler', () => {
  it('indexes the ProductCreated search contract', async () => {
    const indexProduct = vi.fn().mockResolvedValue(undefined);
    const handler = new ProductCreatedHandler(
      { indexProduct } as unknown as ProductIndexer,
      createLogger(),
    );

    await handler.handle(createdEvent(validPayload));

    expect(indexProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: '11111111-1111-1111-1111-111111111111',
        eventId: 'evt-created-1',
        name: 'Nova Headphones',
        slug: 'nova-headphones',
        status: 'draft',
        price: 99.99,
        currency: 'USD',
      }),
    );
  });

  it('rejects an incomplete ProductCreated payload', async () => {
    const indexProduct = vi.fn();
    const handler = new ProductCreatedHandler(
      { indexProduct } as unknown as ProductIndexer,
      createLogger(),
    );

    await expect(handler.handle(createdEvent({ name: 'Nova Headphones' }))).rejects.toMatchObject({
      code: 'INVALID_PRODUCT_CREATED',
    });
    expect(indexProduct).not.toHaveBeenCalled();
  });
});
