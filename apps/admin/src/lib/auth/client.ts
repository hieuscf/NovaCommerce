import { getApiClient } from '@/lib/api/client';
import type { AuthenticationResponse, IAdminAuthClient, LoginRequest } from '@/lib/identity/types';

function createGatewayAdminAuthClient(): IAdminAuthClient {
  return {
    login(credentials: LoginRequest): Promise<AuthenticationResponse> {
      return getApiClient().post<AuthenticationResponse>('/auth/login', credentials);
    },
  };
}

export function createAdminAuthClient(): IAdminAuthClient {
  return createGatewayAdminAuthClient();
}

export const adminAuthClient: IAdminAuthClient = createAdminAuthClient();
