import { randomBytes } from 'node:crypto';
import type {
  IRefreshTokenStore,
  RefreshTokenIssueResult,
} from '../../application/ports/i-refresh-token-store';
import { hashToken } from './bcrypt-password-hasher';

export class CryptoRefreshTokenStore implements IRefreshTokenStore {
  constructor(private readonly ttlMs: number) {}

  issue(): RefreshTokenIssueResult {
    const rawToken = randomBytes(32).toString('base64url');
    const sessionId = randomBytes(16).toString('hex');
    return {
      rawToken,
      tokenHash: this.hash(rawToken),
      sessionId,
      expiresAt: new Date(Date.now() + this.ttlMs),
    };
  }

  hash(rawToken: string): string {
    return hashToken(rawToken);
  }
}
