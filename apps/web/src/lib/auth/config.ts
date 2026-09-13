import { publicEnv } from '@/lib/env';

export function getApiBaseUrl(): string {
  return publicEnv.apiBaseUrl;
}
