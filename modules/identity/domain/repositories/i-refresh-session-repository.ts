import type { RefreshSession } from '../entities/refresh-session';

export interface IRefreshSessionRepository {
  findById(id: string): Promise<RefreshSession | null>;
  findByTokenHash(tokenHash: string): Promise<RefreshSession | null>;
  findIdentityIdBySessionId(sessionId: string): Promise<string | null>;
  save(session: RefreshSession, identityId: string): Promise<void>;
  revokeAllForIdentity(identityId: string): Promise<void>;
}
