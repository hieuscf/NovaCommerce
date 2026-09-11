import { BaseEntity } from '@novacommerce/building-blocks';

export class RefreshSession extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private readonly tokenHash: string,
    private readonly expiresAt: Date,
    private revoked: boolean,
    private revokedAt: Date | undefined,
    private replacedBy: string | undefined,
    private readonly userAgent: string | undefined,
    private readonly ipAddress: string | undefined,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    id: string,
    tokenHash: string,
    expiresAt: Date,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): RefreshSession {
    return new RefreshSession(
      id,
      new Date(),
      new Date(),
      tokenHash,
      expiresAt,
      false,
      undefined,
      undefined,
      metadata?.userAgent,
      metadata?.ipAddress,
    );
  }

  static reconstitute(props: {
    id: string;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
    revokedAt?: Date;
    replacedBy?: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
  }): RefreshSession {
    return new RefreshSession(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.tokenHash,
      props.expiresAt,
      props.revoked,
      props.revokedAt,
      props.replacedBy,
      props.userAgent,
      props.ipAddress,
    );
  }

  revoke(replacedBy?: string): void {
    this.revoked = true;
    this.revokedAt = new Date();
    this.replacedBy = replacedBy;
    this.updatedAt = new Date();
  }

  isRevoked(): boolean {
    return this.revoked;
  }

  isExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt;
  }

  isValid(now: Date = new Date()): boolean {
    return !this.isRevoked() && !this.isExpired(now);
  }

  getTokenHash(): string {
    return this.tokenHash;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getReplacedBy(): string | undefined {
    return this.replacedBy;
  }
}
