import { describe, expect, it, vi } from 'vitest';
import { Role } from '../../domain/entities/role';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import { DeleteRoleHandler } from './delete-role.handler';

function createAuth(can: boolean): IAuthorizationService {
  return {
    can: vi.fn().mockResolvedValue(can),
    getRolesForIdentity: vi.fn().mockResolvedValue([]),
    getPermissionsForIdentity: vi.fn().mockResolvedValue([]),
  };
}

describe('DeleteRoleHandler', () => {
  it('rejects deleting a system role', async () => {
    const role = Role.create('r-super', 'super_admin');
    const roleRepository: IRoleRepository = {
      findById: vi.fn().mockResolvedValue(role),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const handler = new DeleteRoleHandler(roleRepository, createAuth(true));
    const result = await handler.execute({ roleId: role.id, actorId: 'actor-1' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SYSTEM_ROLE_PROTECTED');
    expect(roleRepository.delete).not.toHaveBeenCalled();
  });
});
