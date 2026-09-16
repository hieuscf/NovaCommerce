import { ConfigurationError } from '@novacommerce/building-blocks';

export interface AppConfig {
  readonly nodeEnv: string;
  readonly port: number;
  readonly database: {
    readonly url: string;
  };
  readonly redis: {
    readonly url: string;
  };
  readonly opensearch: {
    readonly url: string;
    readonly username?: string;
    readonly password?: string;
    readonly productIndex?: string;
  };
  readonly search: {
    readonly cacheEnabled: boolean;
    readonly cacheTtlSeconds: number;
  };
  readonly minio: {
    readonly endpoint: string;
    readonly port: number;
    readonly accessKey: string;
    readonly secretKey: string;
    readonly bucket: string;
    readonly useSsl: boolean;
  };
}

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'OPENSEARCH_URL',
  'MINIO_ENDPOINT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
] as const;

function readRequiredString(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();

  if (!value) {
    throw new ConfigurationError(`Missing environment variable: ${key}`);
  }

  return value;
}

function readOptionalString(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key]?.trim();
  return value || undefined;
}

function parsePort(value: string, key: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError(`Invalid environment variable: ${key}`);
  }

  return port;
}

function parseBooleanFlag(value: string | undefined, key: string, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'true' || normalized === '1') {
    return true;
  }

  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  throw new ConfigurationError(`Invalid environment variable: ${key}`);
}

function parsePositiveInteger(value: string | undefined, key: string, defaultValue: number): number {
  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ConfigurationError(`Invalid environment variable: ${key}`);
  }

  return parsed;
}

function parseUrl(value: string, key: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new ConfigurationError(`Invalid environment variable: ${key}`);
  }
}

function parseMinioEndpoint(
  endpointValue: string,
  explicitPort: string | undefined,
): { endpoint: string; port: number } {
  if (endpointValue.includes('://')) {
    const url = parseUrl(endpointValue, 'MINIO_ENDPOINT');

    if (!url.hostname) {
      throw new ConfigurationError('Invalid environment variable: MINIO_ENDPOINT');
    }

    const port = explicitPort
      ? parsePort(explicitPort, 'MINIO_PORT')
      : url.port
        ? parsePort(url.port, 'MINIO_ENDPOINT')
        : 9000;

    return { endpoint: url.hostname, port };
  }

  const [host, portPart] = endpointValue.split(':');

  if (!host) {
    throw new ConfigurationError('Invalid environment variable: MINIO_ENDPOINT');
  }

  if (portPart) {
    return {
      endpoint: host,
      port: parsePort(portPart, 'MINIO_ENDPOINT'),
    };
  }

  if (explicitPort) {
    return {
      endpoint: host,
      port: parsePort(explicitPort, 'MINIO_PORT'),
    };
  }

  return { endpoint: host, port: 9000 };
}

export function validateAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  for (const key of REQUIRED_ENV_VARS) {
    if (!env[key]?.trim()) {
      throw new ConfigurationError(`Missing environment variable: ${key}`);
    }
  }

  const port = parsePort(readRequiredString(env, 'PORT'), 'PORT');
  const databaseUrl = readRequiredString(env, 'DATABASE_URL');
  parseUrl(databaseUrl, 'DATABASE_URL');

  const redisUrl = readRequiredString(env, 'REDIS_URL');
  parseUrl(redisUrl, 'REDIS_URL');

  const opensearchUrl = readRequiredString(env, 'OPENSEARCH_URL');
  parseUrl(opensearchUrl, 'OPENSEARCH_URL');

  const minioEndpoint = parseMinioEndpoint(
    readRequiredString(env, 'MINIO_ENDPOINT'),
    readOptionalString(env, 'MINIO_PORT'),
  );

  return {
    nodeEnv: readRequiredString(env, 'NODE_ENV'),
    port,
    database: {
      url: databaseUrl,
    },
    redis: {
      url: redisUrl,
    },
    opensearch: {
      url: opensearchUrl,
      username: readOptionalString(env, 'OPENSEARCH_USERNAME'),
      password: readOptionalString(env, 'OPENSEARCH_PASSWORD'),
      productIndex: readOptionalString(env, 'OPENSEARCH_PRODUCT_INDEX'),
    },
    search: {
      cacheEnabled: parseBooleanFlag(readOptionalString(env, 'SEARCH_CACHE_ENABLED'), 'SEARCH_CACHE_ENABLED', true),
      cacheTtlSeconds: parsePositiveInteger(
        readOptionalString(env, 'SEARCH_CACHE_TTL_SECONDS'),
        'SEARCH_CACHE_TTL_SECONDS',
        60,
      ),
    },
    minio: {
      endpoint: minioEndpoint.endpoint,
      port: minioEndpoint.port,
      accessKey: readRequiredString(env, 'MINIO_ACCESS_KEY'),
      secretKey: readRequiredString(env, 'MINIO_SECRET_KEY'),
      bucket: readOptionalString(env, 'MINIO_BUCKET') ?? 'novacommerce',
      useSsl: parseBooleanFlag(readOptionalString(env, 'MINIO_USE_SSL'), 'MINIO_USE_SSL', false),
    },
  };
}

export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return validateAppConfig(env);
}
