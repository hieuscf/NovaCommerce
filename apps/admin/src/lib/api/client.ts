import { createApiClient, type ApiClient } from '@novacommerce/frontend';
import { publicEnv } from '@/lib/env';
import { adminSession } from '@/lib/auth/session';

let client: ApiClient | null = null;

export function getApiClient(): ApiClient {
  client ??= createApiClient({
    baseUrl: publicEnv.apiBaseUrl,
    getAccessToken: () => adminSession.getAccessToken(),
  });
  return client;
}
