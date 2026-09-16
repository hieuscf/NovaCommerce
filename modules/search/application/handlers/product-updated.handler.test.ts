import { describe, expect, it, vi } from 'vitest';
import type { ILogger, IntegrationEvent } from '@novacommerce/building-blocks';
import { ProductUpdatedHandler } from './product-updated.handler';
import type { ProductIndexer } from '../services/product-indexer';

function createLogger(): ILogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function updatedEvent(payload: Record<string, unknown>): IntegrationEvent {
  return {
    eventId: 'evt-updated-1',
    eventType: 'catalog.product_updated',
    eventVersion: 1,
    aggregateId: '11111111-1111-1111-1111-111111111111',
    aggregateType: 'Product',
    occurredAt: '2026-01-02T00:00:00.000Z',
    payload,
  };
}

const validPayload = {
  name: 'Nova Headphones Pro',
  slug: 'nova-headphones',
  status: 'published',
  price: 129.99,
  currency: 'USD',
  images: ['https://cdn.example/headphones.jpg'],
  attributes: [{ name: 'color', value: 'black' }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('ProductUpdatedHandler', () => {
  it('updates the ProductUpdated search contract', async () => {
    const updateProduct = vi.fn().mockResolvedValue(undefined);
    const handler = new ProductUpdatedHandler(
      { updateProduct } as unknown as ProductIndexer,
      createLogger(),
    );

    await handler.handle(updatedEvent(validPayload));

    expect(updateProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: '11111111-1111-1111-1111-111111111111',
        eventId: 'evt-updated-1',
        name: 'Nova Headphones Pro',
        status: 'published',
        price: 129.99,
      }),
    );
  });

  it('rejects an incomplete ProductUpdated payload', async () => {
    const updateProduct = vi.fn();
    const handler = new ProductUpdatedHandler(
      { updateProduct } as unknown as ProductIndexer,
      createLogger(),
    );

    await expect(handler.handle(updatedEvent({ name: 'Nova Headphones Pro' }))).rejects.toMatchObject({
      code: 'INVALID_PRODUCT_UPDATED',
    });
    expect(updateProduct).not.toHaveBeenCalled();
  });
});
