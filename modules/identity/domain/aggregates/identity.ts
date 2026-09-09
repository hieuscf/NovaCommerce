import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';
import { Credential } from '../entities/credential';
import { ExternalIdentity } from '../entities/external-identity';
import { RefreshSession } from '../entities/refresh-session';
import { IdentityAuthenticatedEvent } from '../events/identity-authenticated.event';
import { IdentityDisabledEvent } from '../events/identity-disabled.event';
import { IdentityRegisteredEvent } from '../events/identity-registered.event';
import type { EmailAddress } from '../value-objects/email-address';
import type { IdentityId } from '../value-objects/identity-id';

export class Identity extends AggregateRoot<string> {
  private credentials: Credential[] = [];
  private externalIdentities: ExternalIdentity[] = [];
  private refreshSessions: RefreshSession[] = [];
  private disabled = false;

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private email: EmailAddress,
  ) {
    super(id, createdAt, updatedAt);
  }

  static register(id: IdentityId, email: EmailAddress): Result<Identity, IdentityDomainError> {
    const now = new Date();
    const identity = new Identity(id.value, now, now, email);
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
    disabled: boolean;
    credentials: Credential[];
    externalIdentities: ExternalIdentity[];
    refreshSessions: RefreshSession[];
  }): Identity {
    const identity = new Identity(props.id, props.createdAt, props.updatedAt, props.email);
    identity.disabled = props.disabled;
    identity.credentials = [...props.credentials];
    identity.externalIdentities = [...props.externalIdentities];
    identity.refreshSessions = [...props.refreshSessions];
    return identity;
  }

  addCredential(credential: Credential): void {
    this.credentials.push(credential);
    this.updatedAt = new Date();
  }

  addExternalIdentity(externalIdentity: ExternalIdentity): void {
    this.externalIdentities.push(externalIdentity);
    this.updatedAt = new Date();
  }

  addRefreshSession(session: RefreshSession): void {
    this.refreshSessions.push(session);
    this.updatedAt = new Date();
  }

  recordAuthentication(method: string): Result<void, IdentityDomainError> {
    if (this.disabled) {
      return Result.fail(new IdentityDomainError('Identity is disabled', 'IDENTITY_DISABLED'));
    }
    this.updatedAt = new Date();
    this.addDomainEvent(new IdentityAuthenticatedEvent(this.id, new Date(), { method }));
    return Result.ok(undefined);
  }

  disable(): Result<void, IdentityDomainError> {
    if (this.disabled) {
      return Result.fail(new IdentityDomainError('Identity is already disabled', 'IDENTITY_ALREADY_DISABLED'));
    }
    this.disabled = true;
    this.updatedAt = new Date();
    this.addDomainEvent(new IdentityDisabledEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  getEmail(): EmailAddress { return this.email; }
  isDisabled(): boolean { return this.disabled; }
  getCredentials(): readonly Credential[] { return this.credentials; }
  getExternalIdentities(): readonly ExternalIdentity[] { return this.externalIdentities; }
  getRefreshSessions(): readonly RefreshSession[] { return this.refreshSessions; }
}
