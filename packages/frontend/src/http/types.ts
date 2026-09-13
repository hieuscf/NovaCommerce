export const API_V1_PREFIX = '/api/v1';

export const REQUEST_ID_HEADER = 'x-request-id';
export const CORRELATION_ID_HEADER = 'x-correlation-id';

export interface ApiSuccessEnvelope<T> {
  readonly data: T;
  readonly meta: {
    readonly requestId: string;
    readonly correlationId?: string;
    readonly page?: number;
    readonly pageSize?: number;
    readonly total?: number;
  };
}

export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;
}

export interface ApiErrorEnvelope {
  readonly error: ApiErrorBody;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  readonly headers?: Readonly<Record<string, string>>;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly requestId?: string;
  readonly correlationId?: string;
}

export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly getAccessToken?: () => string | null;
  readonly timeoutMs?: number;
  readonly credentials?: RequestCredentials;
  readonly fetchImpl?: typeof fetch;
}
