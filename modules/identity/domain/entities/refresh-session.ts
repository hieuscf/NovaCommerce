import { BaseEntity } from '@novacommerce/building-blocks';

export class RefreshSession extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private readonly tokenHash: string,
    private readonly expiresAt: Date,
    private revoked: boolean,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, tokenHash: string, expiresAt: Date): RefreshSession {
    return new RefreshSession(id, new Date(), new Date(), tokenHash, expiresAt, false);
  }

  revoke(): void {
    this.revoked = true;
    this.updatedAt = new Date();
  }

  isRevoked(): boolean { return this.revoked; }
  getTokenHash(): string { return this.tokenHash; }
  getExpiresAt(): Date { return this.expiresAt; }
}
