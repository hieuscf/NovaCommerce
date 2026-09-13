import { describe, expect, it } from 'vitest';
import { FrontendConfigurationError, validatePublicEnv } from './public-env';

describe('validatePublicEnv', () => {
  it('defaults to the local Gateway in development', () => {
    expect(validatePublicEnv({ NODE_ENV: 'development' })).toEqual({
      apiBaseUrl: 'http://localhost:3000',
    });
  });

  it('requires NEXT_PUBLIC_API_URL in production', () => {
    expect(() => validatePublicEnv({ NODE_ENV: 'production' })).toThrow(FrontendConfigurationError);
  });

  it('accepts a valid public Gateway origin', () => {
    expect(
      validatePublicEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://api.example.com/ignored-path',
      }),
    ).toEqual({ apiBaseUrl: 'https://api.example.com' });
  });

  it('rejects non-http URLs', () => {
    expect(() =>
      validatePublicEnv({
        NEXT_PUBLIC_API_URL: 'javascript:alert(1)',
      }),
    ).toThrow(/NEXT_PUBLIC_API_URL/);
  });
});
