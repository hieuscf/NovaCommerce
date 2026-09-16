import { describe, expect, it } from 'vitest';
import type { IntegrationEvent } from '@novacommerce/building-blocks';
import {
  parseProductCreatedSearchContract,
  parseProductUpdatedSearchContract,
} from './product-search-event.contract';

function productPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Nova Headphones',
    slug: 'nova-headphones',
    status: 'draft',
    price: 99.99,
    currency: 'USD',
    images: ['https://cdn.example/headphones.jpg'],
    attributes: [{ name: 'color', value: 'black' }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createdEvent(payload: Record<string, unknown> = productPayload()): IntegrationEvent {
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

function updatedEvent(payload: Record<string, unknown> = productPayload()): IntegrationEvent {
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

describe('product search event contract', () => {
  it('maps ProductCreated payload to a search index contract', () => {
    const contract = parseProductCreatedSearchContract(createdEvent());

    expect(contract).toMatchObject({
      productId: '11111111-1111-1111-1111-111111111111',
      eventId: 'evt-created-1',
      name: 'Nova Headphones',
      slug: 'nova-headphones',
      status: 'draft',
      price: 99.99,
      currency: 'USD',
      images: ['https://cdn.example/headphones.jpg'],
      attributes: [{ name: 'color', value: 'black' }],
    });
    expect(contract?.createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('projects Catalog categoryId into search categories when categories[] is absent', () => {
    const contract = parseProductCreatedSearchContract(
      createdEvent(productPayload({ categoryId: '44444444-4444-4444-4444-444444444444' })),
    );

    expect(contract?.categories).toEqual([
      { id: '44444444-4444-4444-4444-444444444444', name: 'Category' },
    ]);
  });

  it('maps ProductUpdated payload using the product aggregate id as document identity', () => {
    const contract = parseProductUpdatedSearchContract(
      updatedEvent(
        productPayload({
          name: 'Nova Headphones Pro',
          status: 'published',
          price: 129.99,
          updatedAt: '2026-01-02T00:00:00.000Z',
        }),
      ),
    );

    expect(contract?.productId).toBe('11111111-1111-1111-1111-111111111111');
    expect(contract?.name).toBe('Nova Headphones Pro');
    expect(contract?.status).toBe('published');
    expect(contract?.price).toBe(129.99);
  });

  it('rejects incomplete search snapshots instead of querying Catalog', () => {
    expect(parseProductCreatedSearchContract(createdEvent({ name: 'Nova Headphones' }))).toBeNull();
    expect(
      parseProductUpdatedSearchContract(updatedEvent(productPayload({ status: 'active' }))),
    ).toBeNull();
  });
});
