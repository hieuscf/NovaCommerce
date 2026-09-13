import { createApiClient, getPublicEnv, type ApiClient } from '@novacommerce/frontend';
import { handleForbidden, handleUnauthorized } from '@/lib/auth/auth-interceptors';
import { authSession } from '@/lib/auth/session';

let client: ApiClient | null = null;

export function getApiClient(): ApiClient {
  client ??= createApiClient({
    baseUrl: getPublicEnv().apiBaseUrl,
    getAccessToken: () => authSession.getAccessToken(),
    onUnauthorized: handleUnauthorized,
    onForbidden: handleForbidden,
  });
  return client;
}

export function resetApiClient(): void {
  client = null;
}
