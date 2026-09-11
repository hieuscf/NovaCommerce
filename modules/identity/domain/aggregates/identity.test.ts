import { describe, expect, it } from 'vitest';
import { Identity } from './identity';
import { Credential } from '../entities/credential';
import { RefreshSession } from '../entities/refresh-session';
import { EmailAddress } from '../value-objects/email-address';
import { IdentityId } from '../value-objects/identity-id';

describe('Identity aggregate', () => {
  it('registers and activates identity', () => {
    const result = Identity.register(IdentityId.create('11111111-1111-1111-1111-111111111111'), EmailAddress.create('user@example.com'));
    expect(result.isSuccess).toBe(true);

    const identity = result.getValue();
    expect(identity.getStatus().value).toBe('PENDING_VERIFICATION');
    expect(identity.activate().isSuccess).toBe(true);
    expect(identity.getStatus().value).toBe('ACTIVE');
  });

  it('prevents authentication when locked', () => {
    const identity = Identity.register(IdentityId.create('11111111-1111-1111-1111-111111111111'), EmailAddress.create('user@example.com')).getValue();
    identity.activate();
    identity.lock();

    const auth = identity.recordAuthentication('password');
    expect(auth.isFailure).toBe(true);
    expect(auth.getError().code).toBe('ACCOUNT_LOCKED');
  });

  it('rotates refresh session and revokes old token', () => {
    const identity = Identity.register(IdentityId.create('11111111-1111-1111-1111-111111111111'), EmailAddress.create('user@example.com')).getValue();
    identity.activate();
    identity.addCredential(Credential.create('cred-1', 'hash', 'scrypt'));
    identity.addRefreshSession(RefreshSession.create('session-1', 'hash-1', new Date(Date.now() + 3600000)));

    const newSession = RefreshSession.create('session-2', 'hash-2', new Date(Date.now() + 3600000));
    const rotate = identity.rotateRefreshSession('session-1', newSession);
    expect(rotate.isSuccess).toBe(true);
    expect(identity.getRefreshSessions()[0]?.isRevoked()).toBe(true);
  });
});
