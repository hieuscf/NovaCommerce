import { InfrastructureError } from '@novacommerce/building-blocks';
import { afterEach, describe, expect, it, vi } from 'vitest';

const redisStore = new Map<string, string>();

const mockRedis = {
  status: 'ready',
  connect: vi.fn(async () => undefined),
  quit: vi.fn(async () => undefined),
  ping: vi.fn(async () => 'PONG'),
  get: vi.fn(async (key: string) => redisStore.get(key) ?? null),
  set: vi.fn(async (key: string, value: string) => {
    redisStore.set(key, value);
  }),
  del: vi.fn(async (key: string) => {
    redisStore.delete(key);
  }),
  exists: vi.fn(async (key: string) => (redisStore.has(key) ? 1 : 0)),
};

vi.mock('ioredis', () => ({
  default: vi.fn(() => mockRedis),
}));

import { RedisCacheService } from './redis-cache.service';

describe('RedisCacheService', () => {
  afterEach(() => {
    redisStore.clear();
    vi.clearAllMocks();
    mockRedis.status = 'ready';
  });

  it('connects and pings redis', async () => {
    mockRedis.status = 'wait';
    const service = new RedisCacheService({ url: 'redis://localhost:6379/0' });

    await service.connect();
    await service.ping();

    expect(mockRedis.connect).toHaveBeenCalled();
    expect(mockRedis.ping).toHaveBeenCalled();
  });

  it('stores and retrieves serialized values', async () => {
    const service = new RedisCacheService({ url: 'redis://localhost:6379/0' });

    await service.set('user:1', { name: 'Alice' }, 60);
    const value = await service.get<{ name: string }>('user:1');

    expect(value).toEqual({ name: 'Alice' });
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it('deletes and checks existence', async () => {
    const service = new RedisCacheService({ url: 'redis://localhost:6379/0' });

    await service.set('token:1', 'abc');
    expect(await service.exists('token:1')).toBe(true);

    await service.delete('token:1');
    expect(await service.exists('token:1')).toBe(false);
  });

  it('throws when cache value cannot be deserialized', async () => {
    redisStore.set('novacommerce:broken', '{invalid-json');

    const service = new RedisCacheService({ url: 'redis://localhost:6379/0' });

    await expect(service.get('broken')).rejects.toBeInstanceOf(InfrastructureError);
  });
});
