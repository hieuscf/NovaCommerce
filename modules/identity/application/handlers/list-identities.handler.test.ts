import { describe, expect, it, vi } from 'vitest';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import { ListIdentitiesHandler } from './list-identities.handler';

function createAuth(can: boolean): IAuthorizationService {
  return {
    can: vi.fn().mockResolvedValue(can),
    getRolesForIdentity: vi.fn().mockResolvedValue([]),
    getPermissionsForIdentity: vi.fn().mockResolvedValue([]),
  };
}

describe('ListIdentitiesHandler', () => {
  it('maps identity accounts for the admin directory', async () => {
    const identityRepository: IIdentityRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findMembersByRoleId: vi.fn(),
      countMembersByRoleIds: vi.fn(),
      searchAccounts: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'id-1',
            email: 'customer.one@novacommerce.local',
            status: 'ACTIVE',
            disabled: false,
            roleNames: [],
            lastLoginAt: new Date('2026-09-18T10:00:00.000Z'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
        total: 1,
        summary: { total: 7, customers: 5, admins: 2, blocked: 1 },
      }),
      save: vi.fn(),
    };

    const handler = new ListIdentitiesHandler(identityRepository, createAuth(true));
    const result = await handler.execute({
      actorId: 'admin-1',
      page: 1,
      pageSize: 10,
    });

    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.items[0]?.displayName).toBe('Customer One');
    expect(value.summary.admins).toBe(2);
    expect(identityRepository.searchAccounts).toHaveBeenCalled();
  });

  it('denies actors without identity:account:view', async () => {
    const handler = new ListIdentitiesHandler(
      {
        findById: vi.fn(),
        findByEmail: vi.fn(),
        findMembersByRoleId: vi.fn(),
        countMembersByRoleIds: vi.fn(),
        searchAccounts: vi.fn(),
        save: vi.fn(),
      },
      createAuth(false),
    );

    const result = await handler.execute({ actorId: 'user-1', page: 1, pageSize: 10 });
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PERMISSION_DENIED');
  });
});
