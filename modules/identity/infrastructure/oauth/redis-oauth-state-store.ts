import { randomBytes } from 'node:crypto';
import type { ICache } from '@novacommerce/building-blocks';

export interface OAuthStateRecord {
  readonly provider: string;
  readonly redirectUri: string;
  readonly codeVerifier?: string;
  readonly nonce: string;
}

export interface IOAuthStateStore {
  create(record: Omit<OAuthStateRecord, 'nonce'>): Promise<{ state: string; nonce: string }>;
  consume(state: string): Promise<OAuthStateRecord | null>;
}

const STATE_PREFIX = 'oauth:state:';
const STATE_TTL_SECONDS = 600;

export class RedisOAuthStateStore implements IOAuthStateStore {
  constructor(private readonly cache: ICache) {}

  async create(record: Omit<OAuthStateRecord, 'nonce'>): Promise<{ state: string; nonce: string }> {
    const state = randomBytes(16).toString('base64url');
    const nonce = randomBytes(16).toString('base64url');
    await this.cache.set(
      `${STATE_PREFIX}${state}`,
      JSON.stringify({ ...record, nonce }),
      STATE_TTL_SECONDS,
    );
    return { state, nonce };
  }

  async consume(state: string): Promise<OAuthStateRecord | null> {
    const key = `${STATE_PREFIX}${state}`;
    const raw = await this.cache.get<string>(key);
    await this.cache.delete(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as OAuthStateRecord;
  }
}
