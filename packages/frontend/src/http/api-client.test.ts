import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './api-client';
import { ApiClientError } from '../errors/api-client-error';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from './types';

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  const status = init.status ?? (init.ok === false ? 400 : 200);
  return {
      ok: init.ok ?? (status >= 200 && status < 300),
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response;
}

describe('createApiClient', () => {
  it('posts JSON to the Gateway /api/v1 prefix and unwraps data', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        data: { identityId: 'id-1' },
        meta: { requestId: 'req-1' },
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await client.post<{ identityId: string }>('/auth/register', {
      email: 'user@example.com',
    });

    expect(result).toEqual({ identityId: 'id-1' });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/v1/auth/register');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    const headers = init.headers as Record<string, string>;
    expect(headers[REQUEST_ID_HEADER]).toBeTruthy();
    expect(headers[CORRELATION_ID_HEADER]).toBeTruthy();
    expect(headers.Authorization).toBeUndefined();
  });

  it('attaches a bearer token when provided', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({ data: { ok: true }, meta: { requestId: 'req-1' } }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3000/',
      getAccessToken: () => 'access-token',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await client.get('/me');
    const headers = (fetchImpl.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer access-token');
  });

  it('normalizes Gateway error envelopes', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid credentials',
            requestId: 'req-2',
          },
        },
        { ok: false, status: 401 },
      ),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.post('/auth/login', {})).rejects.toMatchObject({
      name: 'ApiClientError',
      category: 'authentication',
      code: 'UNAUTHENTICATED',
      requestId: 'req-2',
      status: 401,
    } satisfies Partial<ApiClientError>);
  });

  it('returns undefined for 204 responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('no body');
      },
    });

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.post('/auth/forgot-password', { email: 'a@b.com' })).resolves.toBeUndefined();
  });

  it('maps network failures to a network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.get('/products')).rejects.toMatchObject({
      category: 'network',
      code: 'NETWORK_ERROR',
    });
  });
});
