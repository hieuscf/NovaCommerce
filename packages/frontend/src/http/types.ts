import type { ApiClientError } from '../errors/api-client-error';

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
  /** Internal: the original request is being replayed after a 401 recovery. */
  readonly authRetried?: boolean;
}

export type UnauthorizedRecovery = 'retry' | 'throw';

export interface ApiErrorHandlerContext {
  readonly method: HttpMethod;
  readonly path: string;
  readonly retried: boolean;
}

export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly getAccessToken?: () => string | null;
  readonly timeoutMs?: number;
  readonly credentials?: RequestCredentials;
  readonly fetchImpl?: typeof fetch;
  /**
   * Called once per 401 before the error is thrown. Return `retry` to replay
   * the original request with a fresh access token. Apps own session UX.
   */
  readonly onUnauthorized?: (
    error: ApiClientError,
    context: ApiErrorHandlerContext,
  ) => Promise<UnauthorizedRecovery> | UnauthorizedRecovery;
  /**
   * Called on 403 after the response is normalized. Must not clear a valid
   * session. Apps own unauthorized navigation.
   */
  readonly onForbidden?: (error: ApiClientError, context: ApiErrorHandlerContext) => void;
}
