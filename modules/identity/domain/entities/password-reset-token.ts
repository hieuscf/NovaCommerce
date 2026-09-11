import { BaseEntity } from '@novacommerce/building-blocks';

export class PasswordResetToken extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private readonly tokenHash: string,
    private readonly expiresAt: Date,
    private usedAt: Date | undefined,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, tokenHash: string, expiresAt: Date): PasswordResetToken {
    return new PasswordResetToken(id, new Date(), new Date(), tokenHash, expiresAt, undefined);
  }

  static reconstitute(props: {
    id: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): PasswordResetToken {
    return new PasswordResetToken(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.tokenHash,
      props.expiresAt,
      props.usedAt,
    );
  }

  markUsed(): void {
    this.usedAt = new Date();
    this.updatedAt = new Date();
  }

  isExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== undefined;
  }

  isValid(now: Date = new Date()): boolean {
    return !this.isUsed() && !this.isExpired(now);
  }

  getTokenHash(): string {
    return this.tokenHash;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }
}
