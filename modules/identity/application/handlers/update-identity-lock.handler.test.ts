import { describe, expect, it, vi } from 'vitest';
import { Identity } from '../../domain/aggregates/identity';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import { EmailAddress } from '../../domain/value-objects/email-address';
import { IdentityId } from '../../domain/value-objects/identity-id';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import { UpdateIdentityLockHandler } from './update-identity-lock.handler';

const IDENTITY_ID = '11111111-1111-1111-1111-111111111111';
const ACTOR_ID = '22222222-2222-2222-2222-222222222222';

function createAuth(can: boolean): IAuthorizationService {
  return {
    can: vi.fn().mockResolvedValue(can),
    getRolesForIdentity: vi.fn().mockResolvedValue([]),
    getPermissionsForIdentity: vi.fn().mockResolvedValue([]),
  };
}

function createAudit(): IAuditLogger {
  return { log: vi.fn().mockResolvedValue(undefined) };
}

function activeIdentity(): Identity {
  const identity = Identity.register(
    IdentityId.create(IDENTITY_ID),
    EmailAddress.create('customer.one@novacommerce.local'),
  ).getValue();
  identity.activate();
  return identity;
}

function repositoryFor(identity: Identity | null): IIdentityRepository {
  return {
    findById: vi.fn().mockResolvedValue(identity),
    findByEmail: vi.fn(),
    findMembersByRoleId: vi.fn(),
    countMembersByRoleIds: vi.fn(),
    searchAccounts: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe('UpdateIdentityLockHandler', () => {
  it('locks an active identity', async () => {
    const identity = activeIdentity();
    const identityRepository = repositoryFor(identity);
    const auditLogger = createAudit();
    const handler = new UpdateIdentityLockHandler(identityRepository, createAuth(true), auditLogger);

    const result = await handler.execute({
      identityId: IDENTITY_ID,
      locked: true,
      actorId: ACTOR_ID,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('LOCKED');
    expect(identityRepository.save).toHaveBeenCalledWith(identity);
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'ACCOUNT_LOCKED' }));
  });

  it('unlocks a locked identity', async () => {
    const identity = activeIdentity();
    identity.lock();
    const handler = new UpdateIdentityLockHandler(repositoryFor(identity), createAuth(true), createAudit());

    const result = await handler.execute({
      identityId: IDENTITY_ID,
      locked: false,
      actorId: ACTOR_ID,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('ACTIVE');
    expect(result.getValue().disabled).toBe(false);
  });

  it('denies actors without identity:account:edit', async () => {
    const handler = new UpdateIdentityLockHandler(repositoryFor(null), createAuth(false), createAudit());
    const result = await handler.execute({
      identityId: IDENTITY_ID,
      locked: true,
      actorId: ACTOR_ID,
    });
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PERMISSION_DENIED');
  });

  it('refuses locking the actor own account', async () => {
    const handler = new UpdateIdentityLockHandler(
      repositoryFor(activeIdentity()),
      createAuth(true),
      createAudit(),
    );
    const result = await handler.execute({
      identityId: ACTOR_ID,
      locked: true,
      actorId: ACTOR_ID,
    });
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('CANNOT_MODIFY_OWN_ACCOUNT');
  });
});
