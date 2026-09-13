export { createApiClient, type ApiClient } from './http/api-client';
export {
  API_V1_PREFIX,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  type ApiClientConfig,
  type ApiErrorBody,
  type ApiErrorEnvelope,
  type ApiRequestOptions,
  type ApiSuccessEnvelope,
  type HttpMethod,
} from './http/types';

export {
  ApiClientError,
  isApiClientError,
  networkError,
  timeoutError,
  unexpectedError,
  type ApiClientErrorInit,
} from './errors/api-client-error';
export {
  ERROR_CATEGORIES,
  categoryFromBackendCode,
  categoryFromStatus,
  type ErrorCategory,
} from './errors/categories';
export { normalizeApiError, normalizeUnknownError } from './errors/normalize';
export { getUserFacingMessage } from './errors/user-messages';

export {
  FrontendConfigurationError,
  getPublicEnv,
  resetPublicEnvCache,
  validatePublicEnv,
  type PublicEnv,
  type PublicEnvInput,
} from './env/public-env';

export { createRequestId } from './observability/request-id';
export {
  redactContext,
  reportFrontendEvent,
  setFrontendLogReporter,
  type FrontendLogEvent,
  type FrontendLogLevel,
  type FrontendLogReporter,
} from './observability/logger';

export { isSafeRedirectPath, sanitizeRedirect } from './security/safe-redirect';
