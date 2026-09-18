import { getApiClient } from '@/lib/api/client';
import type {
  IIdentitiesClient,
  IdentityAccountListDto,
  IdentityLockResultDto,
  ListIdentitiesQuery,
} from './types';

function toSearchParams(query: ListIdentitiesQuery): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.role) params.set('role', query.role);
  if (query.status) params.set('status', query.status);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function createGatewayIdentitiesClient(): IIdentitiesClient {
  return {
    listIdentities(query: ListIdentitiesQuery): Promise<IdentityAccountListDto> {
      return getApiClient().get<IdentityAccountListDto>(`/identities${toSearchParams(query)}`);
    },
    updateIdentityLock(identityId: string, locked: boolean): Promise<IdentityLockResultDto> {
      return getApiClient().patch<IdentityLockResultDto>(`/identities/${identityId}`, { locked });
    },
  };
}

export const identitiesClient: IIdentitiesClient = createGatewayIdentitiesClient();
