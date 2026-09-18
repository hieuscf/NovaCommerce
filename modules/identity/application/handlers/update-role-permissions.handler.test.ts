import { describe, expect, it, vi } from 'vitest';
import { Permission } from '../../domain/entities/permission';
import { Role } from '../../domain/entities/role';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IPermissionRepository } from '../../domain/repositories/i-permission-repository';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { PermissionKey } from '../../domain/value-objects/permission-key';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import { UpdateRolePermissionsHandler } from './update-role-permissions.handler';

function createAuth(can: boolean): IAuthorizationService {
  return {
    can: vi.fn().mockResolvedValue(can),
    getRolesForIdentity: vi.fn().mockResolvedValue([]),
    getPermissionsForIdentity: vi.fn().mockResolvedValue([]),
  };
}

describe('UpdateRolePermissionsHandler', () => {
  it('grants and revokes permission keys in one save', async () => {
    const view = PermissionKey.create('catalog:product:view');
    const create = PermissionKey.create('catalog:product:create');
    const role = Role.create('role-1', 'inventory_manager');
    role.assignPermission(view);

    const roleRepository: IRoleRepository = {
      findById: vi.fn().mockResolvedValue(role),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const permissionRepository: IPermissionRepository = {
      findById: vi.fn(),
      findByKey: vi.fn(),
      findAll: vi.fn().mockResolvedValue([
        Permission.create('p-view', view),
        Permission.create('p-create', create),
      ]),
      save: vi.fn(),
    };
    const identityRepository: IIdentityRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findMembersByRoleId: vi.fn(),
      countMembersByRoleIds: vi.fn().mockResolvedValue(new Map([[role.id, 2]])),
      save: vi.fn(),
    };
    const auditLogger: IAuditLogger = { log: vi.fn() };

    const handler = new UpdateRolePermissionsHandler(
      roleRepository,
      permissionRepository,
      identityRepository,
      createAuth(true),
      auditLogger,
    );

    const result = await handler.execute({
      roleId: role.id,
      actorId: 'actor-1',
      changes: [
        { permissionKey: 'catalog:product:create', granted: true },
        { permissionKey: 'catalog:product:view', granted: false },
      ],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().permissions).toEqual(['catalog:product:create']);
    expect(result.getValue().memberCount).toBe(2);
    expect(roleRepository.save).toHaveBeenCalledTimes(1);
    expect(auditLogger.log).toHaveBeenCalledTimes(1);
  });

  it('rejects unknown catalog keys', async () => {
    const role = Role.create('role-1', 'analyst');
    const handler = new UpdateRolePermissionsHandler(
      {
        findById: vi.fn().mockResolvedValue(role),
        findByName: vi.fn(),
        findAll: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
      },
      {
        findById: vi.fn(),
        findByKey: vi.fn(),
        findAll: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
      },
      {
        findById: vi.fn(),
        findByEmail: vi.fn(),
        findMembersByRoleId: vi.fn(),
        countMembersByRoleIds: vi.fn(),
        save: vi.fn(),
      },
      createAuth(true),
      { log: vi.fn() },
    );

    const result = await handler.execute({
      roleId: role.id,
      actorId: 'actor-1',
      changes: [{ permissionKey: 'catalog:product:view', granted: true }],
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PERMISSION_NOT_FOUND');
  });
});
