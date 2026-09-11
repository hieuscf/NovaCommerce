import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';
import { Credential } from '../entities/credential';
import { ExternalIdentity } from '../entities/external-identity';
import { RefreshSession } from '../entities/refresh-session';
import { IdentityAuthenticatedEvent } from '../events/identity-authenticated.event';
import { IdentityDisabledEvent } from '../events/identity-disabled.event';
import { IdentityRegisteredEvent } from '../events/identity-registered.event';
import { PasswordChangedEvent } from '../events/password-changed.event';
import { PasswordResetCompletedEvent } from '../events/password-reset-completed.event';
import { PasswordResetRequestedEvent } from '../events/password-reset-requested.event';
import { RefreshTokenRotatedEvent } from '../events/refresh-token-rotated.event';
import { RoleAssignedEvent } from '../events/role-assigned.event';
import { RoleRevokedEvent } from '../events/role-revoked.event';
import { UserLoggedOutEvent } from '../events/user-logged-out.event';
import type { AccountStatus } from '../value-objects/account-status';
import { AccountStatus as AccountStatusFactory } from '../value-objects/account-status';
import type { EmailAddress } from '../value-objects/email-address';
import type { IdentityId } from '../value-objects/identity-id';

export class Identity extends AggregateRoot<string> {
  private credentials: Credential[] = [];
  private externalIdentities: ExternalIdentity[] = [];
  private refreshSessions: RefreshSession[] = [];
  private roleIds: string[] = [];
  private status: AccountStatus;
  private disabled = false;

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private email: EmailAddress,
    status: AccountStatus,
  ) {
    super(id, createdAt, updatedAt);
    this.status = status;
    this.disabled = status.value !== 'ACTIVE';
  }

  static register(id: IdentityId, email: EmailAddress): Result<Identity, IdentityDomainError> {
    const now = new Date();
    const identity = new Identity(
      id.value,
      now,
      now,
      email,
      AccountStatusFactory.pendingVerification(),
    );
    identity.addDomainEvent(
      new IdentityRegisteredEvent(id.value, now, { email: email.value }),
    );
    return Result.ok(identity);
  }

  static reconstitute(props: {
    id: string;
    email: EmailAddress;
    createdAt: Date;
    updatedAt: Date;
    status: AccountStatus;
    disabled: boolean;
    credentials: Credential[];
    externalIdentities: ExternalIdentity[];
    refreshSessions: RefreshSession[];
    roleIds: string[];
  }): Identity {
    const identity = new Identity(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.email,
      props.status,
    );
    identity.disabled = props.disabled;
    identity.credentials = [...props.credentials];
    identity.externalIdentities = [...props.externalIdentities];
    identity.refreshSessions = [...props.refreshSessions];
    identity.roleIds = [...props.roleIds];
    return identity;
  }

  activate(): Result<void, IdentityDomainError> {
    try {
      this.status = this.status.activate();
      this.disabled = false;
      this.updatedAt = new Date();
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as IdentityDomainError);
    }
  }

  lock(): Result<void, IdentityDomainError> {
    try {
      this.status = this.status.lock();
      this.disabled = true;
      this.updatedAt = new Date();
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as IdentityDomainError);
    }
  }

  unlock(): Result<void, IdentityDomainError> {
    try {
      this.status = this.status.unlock();
      this.disabled = false;
      this.updatedAt = new Date();
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as IdentityDomainError);
    }
  }

  addCredential(credential: Credential): void {
    this.credentials.push(credential);
    this.updatedAt = new Date();
  }

  updateCredential(credential: Credential): void {
    const index = this.credentials.findIndex((item) => item.id === credential.id);
    if (index >= 0) {
      this.credentials[index] = credential;
      this.updatedAt = new Date();
    }
  }

  addExternalIdentity(externalIdentity: ExternalIdentity): void {
    this.externalIdentities.push(externalIdentity);
    this.updatedAt = new Date();
  }

  addRefreshSession(session: RefreshSession): void {
    this.refreshSessions.push(session);
    this.updatedAt = new Date();
  }

  rotateRefreshSession(oldSessionId: string, newSession: RefreshSession): Result<void, IdentityDomainError> {
    const oldSession = this.refreshSessions.find((session) => session.id === oldSessionId);
    if (!oldSession) {
      return Result.fail(new IdentityDomainError('Refresh session not found', 'REFRESH_SESSION_NOT_FOUND'));
    }
    if (oldSession.isRevoked()) {
      return Result.fail(new IdentityDomainError('Refresh token revoked', 'REFRESH_TOKEN_REVOKED'));
    }
    if (oldSession.isExpired()) {
      return Result.fail(new IdentityDomainError('Refresh token expired', 'REFRESH_TOKEN_EXPIRED'));
    }

    oldSession.revoke(newSession.id);
    this.refreshSessions.push(newSession);
    this.updatedAt = new Date();
    this.addDomainEvent(
      new RefreshTokenRotatedEvent(this.id, new Date(), {
        sessionId: oldSessionId,
        replacedBySessionId: newSession.id,
      }),
    );
    return Result.ok(undefined);
  }

  revokeRefreshSession(sessionId: string): Result<void, IdentityDomainError> {
    const session = this.refreshSessions.find((item) => item.id === sessionId);
    if (!session) {
      return Result.fail(new IdentityDomainError('Refresh session not found', 'REFRESH_SESSION_NOT_FOUND'));
    }
    session.revoke();
    this.updatedAt = new Date();
    this.addDomainEvent(new UserLoggedOutEvent(this.id, new Date(), { sessionId }));
    return Result.ok(undefined);
  }

  revokeAllRefreshSessions(): void {
    for (const session of this.refreshSessions) {
      if (!session.isRevoked()) {
        session.revoke();
      }
    }
    this.updatedAt = new Date();
  }

  recordAuthentication(method: string): Result<void, IdentityDomainError> {
    if (this.disabled || !this.status.canAuthenticate()) {
      return Result.fail(new IdentityDomainError('Identity cannot authenticate', 'ACCOUNT_LOCKED'));
    }
    this.updatedAt = new Date();
    this.addDomainEvent(new IdentityAuthenticatedEvent(this.id, new Date(), { method }));
    return Result.ok(undefined);
  }

  recordPasswordChange(): void {
    this.updatedAt = new Date();
    this.addDomainEvent(new PasswordChangedEvent(this.id, new Date(), {}));
  }

  recordPasswordResetRequest(): void {
    this.updatedAt = new Date();
    this.addDomainEvent(
      new PasswordResetRequestedEvent(this.id, new Date(), { email: this.email.value }),
    );
  }

  recordPasswordResetCompleted(): void {
    this.updatedAt = new Date();
    this.addDomainEvent(new PasswordResetCompletedEvent(this.id, new Date(), {}));
  }

  assignRole(roleId: string, roleName: string): Result<void, IdentityDomainError> {
    if (this.roleIds.includes(roleId)) {
      return Result.fail(new IdentityDomainError('Role already assigned', 'ROLE_ALREADY_ASSIGNED'));
    }
    this.roleIds.push(roleId);
    this.updatedAt = new Date();
    this.addDomainEvent(new RoleAssignedEvent(this.id, new Date(), { roleId, roleName }));
    return Result.ok(undefined);
  }

  revokeRole(roleId: string, roleName: string): Result<void, IdentityDomainError> {
    if (!this.roleIds.includes(roleId)) {
      return Result.fail(new IdentityDomainError('Role not assigned', 'ROLE_NOT_ASSIGNED'));
    }
    this.roleIds = this.roleIds.filter((id) => id !== roleId);
    this.updatedAt = new Date();
    this.addDomainEvent(new RoleRevokedEvent(this.id, new Date(), { roleId, roleName }));
    return Result.ok(undefined);
  }

  disable(): Result<void, IdentityDomainError> {
    if (this.disabled) {
      return Result.fail(new IdentityDomainError('Identity is already disabled', 'IDENTITY_ALREADY_DISABLED'));
    }
    this.disabled = true;
    this.status = AccountStatusFactory.from('INACTIVE');
    this.updatedAt = new Date();
    this.addDomainEvent(new IdentityDisabledEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  getEmail(): EmailAddress {
    return this.email;
  }

  getStatus(): AccountStatus {
    return this.status;
  }

  isDisabled(): boolean {
    return this.disabled;
  }

  getCredentials(): readonly Credential[] {
    return this.credentials;
  }

  getExternalIdentities(): readonly ExternalIdentity[] {
    return this.externalIdentities;
  }

  getRefreshSessions(): readonly RefreshSession[] {
    return this.refreshSessions;
  }

  getRoleIds(): readonly string[] {
    return this.roleIds;
  }
}
