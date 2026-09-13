import { createApiClient, type ApiClient } from '@novacommerce/frontend';
import { publicEnv } from '@/lib/env';
import { authSession } from '@/lib/auth/session';

let client: ApiClient | null = null;

export function getApiClient(): ApiClient {
  client ??= createApiClient({
    baseUrl: publicEnv.apiBaseUrl,
    getAccessToken: () => authSession.getAccessToken(),
  });
  return client;
}

export function resetApiClient(): void {
  client = null;
}
