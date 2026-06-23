import type { NextRequest } from 'next/server';

import type { ApiEnvelope, ApiErrorPayload } from '@/types/api';
import type { AuthTokens } from '@/types/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type IdentityRequestOptions = {
  method?: HttpMethod;
  path: string;
  accessToken?: string | null;
  body?: BodyInit | object | null;
  headers?: HeadersInit;
};

type AuthenticatedIdentityRequestOptions = IdentityRequestOptions & {
  refreshToken?: string | null;
};

type RequestWithTokenCookies = Pick<NextRequest, 'cookies'>;

const JSON_CONTENT_TYPE = 'application/json';
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

const refreshQueue = new Map<string, Promise<AuthTokens>>();

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(error: ApiErrorPayload, status = 400) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
    this.status = status;
  }
}

function getIdentityBaseUrl() {
  return (
    process.env.IDENTITY_SERVICE_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ''
  );
}

function createIdentityUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getIdentityBaseUrl()}${normalizedPath}`;
}

function toApiClientError(error: unknown, status = 500) {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiClientError(
      { code: 'INTERNAL_ERROR', message: error.message },
      status,
    );
  }

  return new ApiClientError(
    {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error.',
    },
    status,
  );
}

async function parseIdentityResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  let envelope: ApiEnvelope<T> | null = null;

  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    if (response.ok) {
      return null as T;
    }

    throw new ApiClientError(
      {
        code: 'INVALID_RESPONSE',
        message: 'Identity service returned an invalid response.',
      },
      response.status,
    );
  }

  if (!response.ok || envelope.error) {
    const fallbackError = {
      code: 'REQUEST_FAILED',
      message: `Identity service request failed with status ${response.status}.`,
    };
    throw new ApiClientError(envelope.error ?? fallbackError, response.status);
  }

  return envelope.data;
}

function buildRequestBody(body?: BodyInit | object | null) {
  if (!body) {
    return undefined;
  }

  if (body instanceof FormData || typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

function buildHeaders(options: IdentityRequestOptions) {
  const headers = new Headers(options.headers);

  if (
    !headers.has('Content-Type') &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set('Content-Type', JSON_CONTENT_TYPE);
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  return headers;
}

export async function requestIdentity<T>(
  options: IdentityRequestOptions,
): Promise<T> {
  const response = await fetch(createIdentityUrl(options.path), {
    method: options.method ?? 'GET',
    headers: buildHeaders(options),
    body: buildRequestBody(options.body),
    cache: 'no-store',
  });

  return parseIdentityResponse<T>(response);
}

async function refreshIdentityToken(refreshToken: string): Promise<AuthTokens> {
  const queued = refreshQueue.get(refreshToken);
  if (queued) {
    return queued;
  }

  const refreshPromise = requestIdentity<AuthTokens>({
    method: 'POST',
    path: '/auth/refresh',
    body: { refresh_token: refreshToken },
  });

  refreshQueue.set(refreshToken, refreshPromise);

  try {
    return await refreshPromise;
  } finally {
    refreshQueue.delete(refreshToken);
  }
}

export async function requestIdentityWithRefresh<T>(
  options: AuthenticatedIdentityRequestOptions,
): Promise<{ data: T; refreshedTokens?: AuthTokens }> {
  try {
    const data = await requestIdentity<T>(options);
    return { data };
  } catch (error) {
    const parsedError = toApiClientError(error);
    const shouldTryRefresh =
      parsedError.status === 401 &&
      !!options.refreshToken &&
      !options.path.startsWith('/auth/refresh');

    if (!shouldTryRefresh || !options.refreshToken) {
      throw parsedError;
    }

    const refreshedTokens = await refreshIdentityToken(options.refreshToken);
    const data = await requestIdentity<T>({
      ...options,
      accessToken: refreshedTokens.access_token,
    });

    return { data, refreshedTokens };
  }
}

export function extractAuthCookies(request: RequestWithTokenCookies) {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export function getAuthCookieConfig(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export const cookieKeys = {
  accessToken: ACCESS_TOKEN_COOKIE,
  refreshToken: REFRESH_TOKEN_COOKIE,
};

export const cookieAges = {
  accessToken: ACCESS_TOKEN_MAX_AGE,
  refreshToken: REFRESH_TOKEN_MAX_AGE,
};
