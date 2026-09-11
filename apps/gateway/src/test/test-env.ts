const DEFAULT_TEST_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test?schema=public',
  REDIS_URL: 'redis://localhost:6379/0',
  OPENSEARCH_URL: 'http://localhost:9200',
  MINIO_ENDPOINT: 'localhost:9000',
  MINIO_ACCESS_KEY: 'test-access-key',
  MINIO_SECRET_KEY: 'test-secret-key',
  MINIO_BUCKET: 'novacommerce-test',
  MINIO_USE_SSL: 'false',
  JWT_SECRET: 'test-secret',
  JWT_ACCESS_TOKEN_TTL: '15m',
  JWT_REFRESH_TOKEN_TTL: '7d',
  PASSWORD_HASH_COST: '1024',
  PASSWORD_RESET_TOKEN_TTL: '1h',
};

export function applyTestEnvironment(overrides: Record<string, string> = {}): void {
  const values = { ...DEFAULT_TEST_ENV, ...overrides };

  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }
}
