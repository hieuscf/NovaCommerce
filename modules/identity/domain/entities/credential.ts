import { BaseEntity } from '@novacommerce/building-blocks';

export class Credential extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private readonly passwordHash: string,
    private readonly algorithm: string,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, passwordHash: string, algorithm: string): Credential {
    return new Credential(id, new Date(), new Date(), passwordHash, algorithm);
  }

  getPasswordHash(): string { return this.passwordHash; }
  getAlgorithm(): string { return this.algorithm; }
}
