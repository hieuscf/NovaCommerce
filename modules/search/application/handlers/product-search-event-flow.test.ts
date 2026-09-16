import { describe, expect, it, vi } from 'vitest';
import { InMemoryEventBus, type ILogger } from '@novacommerce/building-blocks';
import { ProductCreatedHandler } from './product-created.handler';
import { ProductUpdatedHandler } from './product-updated.handler';
import { registerSearchEventHandlers } from '../register-search-event-handlers';
import type { ProductIndexer } from '../services/product-indexer';

function createLogger(): ILogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

const snapshot = {
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

describe('Search product event flow', () => {
  it('consumes ProductCreated and ProductUpdated through the event bus', async () => {
    const indexProduct = vi.fn().mockResolvedValue(undefined);
    const updateProduct = vi.fn().mockResolvedValue(undefined);
    const indexer = { indexProduct, updateProduct } as unknown as ProductIndexer;
    const logger = createLogger();
    const eventBus = new InMemoryEventBus();

    registerSearchEventHandlers(
      eventBus,
      new ProductCreatedHandler(indexer, logger),
      new ProductUpdatedHandler(indexer, logger),
    );

    await eventBus.publish({
      eventId: 'evt-created-1',
      eventType: 'catalog.product_created',
      eventVersion: 1,
      aggregateId: '11111111-1111-1111-1111-111111111111',
      aggregateType: 'Product',
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: snapshot,
    });

    await eventBus.publish({
      eventId: 'evt-updated-1',
      eventType: 'catalog.product_updated',
      eventVersion: 1,
      aggregateId: '11111111-1111-1111-1111-111111111111',
      aggregateType: 'Product',
      occurredAt: '2026-01-02T00:00:00.000Z',
      payload: {
        ...snapshot,
        name: 'Nova Headphones Pro',
        status: 'published',
        price: 129.99,
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    });

    expect(indexProduct).toHaveBeenCalledOnce();
    expect(updateProduct).toHaveBeenCalledOnce();
    expect(indexProduct.mock.calls[0][0].productId).toBe('11111111-1111-1111-1111-111111111111');
    expect(updateProduct.mock.calls[0][0].productId).toBe('11111111-1111-1111-1111-111111111111');
  });
});
