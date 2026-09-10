import {
  AvailabilityError,
  type ICache,
  InfrastructureError,
} from '@novacommerce/building-blocks';
import Redis from 'ioredis';

export interface RedisCacheServiceOptions {
  readonly url: string;
  readonly keyPrefix?: string;
}

export class RedisCacheService implements ICache {
  private readonly client: Redis;
  private readonly keyPrefix: string;

  constructor(options: RedisCacheServiceOptions) {
    this.keyPrefix = options.keyPrefix ?? 'novacommerce:';
    this.client = new Redis(options.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async connect(): Promise<void> {
    if (this.client.status === 'ready') {
      return;
    }

    try {
      await this.client.connect();
    } catch (error) {
      throw new AvailabilityError('Failed to connect to Redis', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.status === 'end') {
      return;
    }

    await this.client.quit();
  }

  async ping(): Promise<void> {
    try {
      const response = await this.client.ping();

      if (response !== 'PONG') {
        throw new AvailabilityError('Unexpected Redis PING response');
      }
    } catch (error) {
      if (error instanceof AvailabilityError) {
        throw error;
      }

      throw new AvailabilityError('Redis health check failed', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.buildKey(key));

      if (value === null) {
        return null;
      }

      return this.deserialize<T>(value);
    } catch (error) {
      throw this.wrapOperationError('Redis GET failed', error);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = this.serialize(value);
      const redisKey = this.buildKey(key);

      if (ttlSeconds !== undefined) {
        await this.client.set(redisKey, serialized, 'EX', ttlSeconds);
        return;
      }

      await this.client.set(redisKey, serialized);
    } catch (error) {
      throw this.wrapOperationError('Redis SET failed', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(this.buildKey(key));
    } catch (error) {
      throw this.wrapOperationError('Redis DELETE failed', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const count = await this.client.exists(this.buildKey(key));
      return count > 0;
    } catch (error) {
      throw this.wrapOperationError('Redis EXISTS failed', error);
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private serialize<T>(value: T): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new InfrastructureError('Failed to serialize cache value', 'CACHE_SERIALIZATION_ERROR', error);
    }
  }

  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new InfrastructureError('Failed to deserialize cache value', 'CACHE_DESERIALIZATION_ERROR', error);
    }
  }

  private wrapOperationError(message: string, error: unknown): InfrastructureError {
    if (error instanceof InfrastructureError) {
      return error;
    }

    return new InfrastructureError(message, 'CACHE_ERROR', error);
  }
}
