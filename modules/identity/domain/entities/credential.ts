import { BaseEntity } from '@novacommerce/building-blocks';

export class Credential extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private passwordHash: string,
    private readonly algorithm: string,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, passwordHash: string, algorithm: string): Credential {
    return new Credential(id, new Date(), new Date(), passwordHash, algorithm);
  }

  static reconstitute(props: {
    id: string;
    passwordHash: string;
    algorithm: string;
    createdAt: Date;
    updatedAt: Date;
  }): Credential {
    return new Credential(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.passwordHash,
      props.algorithm,
    );
  }

  updatePasswordHash(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getAlgorithm(): string {
    return this.algorithm;
  }
}
