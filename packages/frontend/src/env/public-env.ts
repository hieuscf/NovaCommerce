const DEFAULT_DEV_API_URL = 'http://localhost:3000';

export interface PublicEnv {
  readonly apiBaseUrl: string;
}

export type PublicEnvInput = {
  readonly NEXT_PUBLIC_API_URL?: string;
  readonly NODE_ENV?: string;
  readonly [key: string]: string | undefined;
};

export class FrontendConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrontendConfigurationError';
  }
}

function parseHttpUrl(value: string, key: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new FrontendConfigurationError(`Invalid environment variable: ${key}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new FrontendConfigurationError(`Invalid environment variable: ${key}`);
  }

  return url.origin;
}

export function validatePublicEnv(env: PublicEnvInput = process.env): PublicEnv {
  const raw = env.NEXT_PUBLIC_API_URL?.trim();
  const isProduction = env.NODE_ENV === 'production';

  if (!raw) {
    if (isProduction) {
      throw new FrontendConfigurationError('Missing environment variable: NEXT_PUBLIC_API_URL');
    }
    return { apiBaseUrl: DEFAULT_DEV_API_URL };
  }

  return {
    apiBaseUrl: parseHttpUrl(raw, 'NEXT_PUBLIC_API_URL'),
  };
}

let cached: PublicEnv | null = null;

export function getPublicEnv(env: PublicEnvInput = process.env): PublicEnv {
  if (env !== process.env) {
    return validatePublicEnv(env);
  }
  cached ??= validatePublicEnv(env);
  return cached;
}

export function resetPublicEnvCache(): void {
  cached = null;
}
