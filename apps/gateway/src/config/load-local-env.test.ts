import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { applyEnvFile, resolveCorsOrigins } from './load-local-env';

const previousCors = process.env.NC_TEST_CORS_KEY;

afterEach(() => {
  if (previousCors === undefined) {
    delete process.env.NC_TEST_CORS_KEY;
  } else {
    process.env.NC_TEST_CORS_KEY = previousCors;
  }
});

describe('resolveCorsOrigins', () => {
  it('uses CORS_ORIGIN when set', () => {
    expect(
      resolveCorsOrigins({
        NODE_ENV: 'production',
        CORS_ORIGIN: 'https://shop.example, https://admin.example',
      }),
    ).toEqual(['https://shop.example', 'https://admin.example']);
  });

  it('defaults to local web and admin origins outside production', () => {
    expect(resolveCorsOrigins({ NODE_ENV: 'development' })).toEqual([
      'http://localhost:3001',
      'http://localhost:3002',
    ]);
  });

  it('does not enable CORS in production without CORS_ORIGIN', () => {
    expect(resolveCorsOrigins({ NODE_ENV: 'production' })).toBeUndefined();
  });
});

describe('applyEnvFile', () => {
  it('loads unset keys from a dotenv file', () => {
    delete process.env.NC_TEST_CORS_KEY;
    const directory = mkdtempSync(join(tmpdir(), 'nc-env-'));
    const path = join(directory, '.env');
    writeFileSync(path, 'NC_TEST_CORS_KEY=from-file\n');

    applyEnvFile(path);

    expect(process.env.NC_TEST_CORS_KEY).toBe('from-file');
  });
});
