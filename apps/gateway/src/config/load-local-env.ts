import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Loads a dotenv file into `process.env` without overriding existing values.
 * Nest ConfigModule runs after `loadAppConfig()` in `main.ts`, so local
 * `start:dev` still needs the repo `.env` before the HTTP server boots.
 */
export function applyEnvFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separator = line.indexOf('=');
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim().replace(/^\uFEFF/, '');
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadLocalEnvFiles(cwd = process.cwd()): void {
  applyEnvFile(resolve(cwd, '.env'));
  applyEnvFile(resolve(cwd, '../../.env'));
}

type CorsEnv = {
  NODE_ENV?: string;
  CORS_ORIGIN?: string;
};

export function resolveCorsOrigins(
  env: CorsEnv = {
    NODE_ENV: process.env.NODE_ENV,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  },
): string[] | undefined {
  const configured = env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (configured && configured.length > 0) {
    return configured;
  }

  if (env.NODE_ENV !== 'production') {
    return ['http://localhost:3001', 'http://localhost:3002'];
  }

  return undefined;
}
