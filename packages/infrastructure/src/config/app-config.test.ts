import { ConfigurationError } from '@novacommerce/building-blocks';
import { describe, expect, it } from 'vitest';
import { validateAppConfig } from './app-config';

const BASE_ENV: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://user:pass@postgres:5432/novacommerce?schema=public',
  REDIS_URL: 'redis://:secret@redis:6379/0',
  OPENSEARCH_URL: 'http://opensearch:9200',
  MINIO_ENDPOINT: 'minio:9000',
  MINIO_ACCESS_KEY: 'access-key',
  MINIO_SECRET_KEY: 'secret-key',
  MINIO_BUCKET: 'novacommerce',
  MINIO_USE_SSL: 'false',
};

describe('validateAppConfig', () => {
  it('returns typed config for valid environment', () => {
    const config = validateAppConfig({ ...BASE_ENV });

    expect(config.nodeEnv).toBe('test');
    expect(config.port).toBe(3000);
    expect(config.database.url).toContain('postgres:5432');
    expect(config.redis.url).toContain('redis:6379');
    expect(config.opensearch.url).toBe('http://opensearch:9200');
    expect(config.minio.endpoint).toBe('minio');
    expect(config.minio.port).toBe(9000);
    expect(config.minio.bucket).toBe('novacommerce');
    expect(config.minio.useSsl).toBe(false);
  });

  it('throws when required variable is missing', () => {
    const env = { ...BASE_ENV };
    delete env.REDIS_URL;

    expect(() => validateAppConfig(env)).toThrow(ConfigurationError);
    expect(() => validateAppConfig(env)).toThrow('Missing environment variable: REDIS_URL');
  });

  it('throws for invalid port', () => {
    expect(() => validateAppConfig({ ...BASE_ENV, PORT: '70000' })).toThrow(
      'Invalid environment variable: PORT',
    );
  });

  it('throws for invalid database url', () => {
    expect(() => validateAppConfig({ ...BASE_ENV, DATABASE_URL: 'not-a-url' })).toThrow(
      'Invalid environment variable: DATABASE_URL',
    );
  });

  it('does not include secret values in error messages', () => {
    try {
      validateAppConfig({ ...BASE_ENV, REDIS_URL: '' });
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(String(error)).not.toContain('secret');
    }
  });
});
