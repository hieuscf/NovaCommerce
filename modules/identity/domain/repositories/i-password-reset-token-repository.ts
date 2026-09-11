import type { PasswordResetToken } from '../entities/password-reset-token';

export interface IPasswordResetTokenRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  findIdentityIdByTokenHash(tokenHash: string): Promise<string | null>;
  save(token: PasswordResetToken, identityId: string): Promise<void>;
  invalidateAllForIdentity(identityId: string): Promise<void>;
}
