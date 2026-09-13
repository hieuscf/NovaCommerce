import {
  API_V1_PREFIX,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  type ApiClientConfig,
  type ApiRequestOptions,
  type ApiSuccessEnvelope,
  type HttpMethod,
} from './types';
import { networkError, timeoutError, unexpectedError } from '../errors/api-client-error';
import { normalizeApiError } from '../errors/normalize';
import { createRequestId } from '../observability/request-id';

const DEFAULT_TIMEOUT_MS = 15_000;

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath.startsWith(API_V1_PREFIX) || normalizedPath.startsWith('/api/')) {
    return `${normalizedBase}${normalizedPath}`;
  }
  return `${normalizedBase}${API_V1_PREFIX}${normalizedPath}`;
}

function mergeAbortSignals(timeoutMs: number, external?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!external) {
    return timeout;
  }
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([timeout, external]);
  }
  return timeout;
}

export interface ApiClient {
  request<T>(method: HttpMethod, path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  function resolveFetch(): typeof fetch {
    return config.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const requestId = options.requestId ?? createRequestId();
    const correlationId = options.correlationId ?? requestId;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
      [CORRELATION_ID_HEADER]: correlationId,
      ...options.headers,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const accessToken = config.getAccessToken?.();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response: Response;
    try {
      response = await resolveFetch()(joinUrl(config.baseUrl, path), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: config.credentials ?? 'include',
        signal: mergeAbortSignals(options.timeoutMs ?? timeoutMs, options.signal),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw timeoutError();
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw timeoutError();
      }
      throw networkError();
    }

    if (!response.ok) {
      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch {
        parsed = undefined;
      }
      const error = normalizeApiError(parsed, response.status);
      const retried = options.authRetried === true;
      const handlerContext = { method, path, retried };

      if (error.status === 401 && config.onUnauthorized) {
        const recovery = await config.onUnauthorized(error, handlerContext);
        if (recovery === 'retry' && !retried) {
          return request<T>(method, path, body, { ...options, authRetried: true });
        }
      }

      if (error.status === 403) {
        config.onForbidden?.(error, handlerContext);
      }

      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    try {
      const envelope = (await response.json()) as ApiSuccessEnvelope<T>;
      return envelope.data;
    } catch {
      throw unexpectedError();
    }
  }

  return {
    request,
    get: (path, options) => request('GET', path, undefined, options),
    post: (path, body, options) => request('POST', path, body, options),
    put: (path, body, options) => request('PUT', path, body, options),
    patch: (path, body, options) => request('PATCH', path, body, options),
    delete: (path, options) => request('DELETE', path, undefined, options),
  };
}
