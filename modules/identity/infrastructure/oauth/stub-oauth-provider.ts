import type {
  IOAuthProvider,
  OAuthAuthorizationRequest,
  OAuthTokenExchangeResult,
} from '../../application/ports/i-oauth-provider';
import type { IOAuthStateStore } from './redis-oauth-state-store';

export class StubOAuthProvider implements IOAuthProvider {
  readonly providerName: string;

  constructor(
    providerName: string,
    private readonly stateStore: IOAuthStateStore,
  ) {
    this.providerName = providerName;
  }

  async createAuthorizationRequest(redirectUri: string): Promise<OAuthAuthorizationRequest> {
    const { state, nonce } = await this.stateStore.create({
      provider: this.providerName,
      redirectUri,
      codeVerifier: randomVerifier(),
    });

    return {
      authorizationUrl: `https://oauth.example.com/${this.providerName}/authorize?state=${state}&nonce=${nonce}`,
      state,
      codeVerifier: randomVerifier(),
    };
  }

  async exchangeCode(
    code: string,
    redirectUri: string,
    state: string,
    codeVerifier?: string,
  ): Promise<OAuthTokenExchangeResult> {
    const record = await this.stateStore.consume(state);
    if (!record || record.provider !== this.providerName || record.redirectUri !== redirectUri) {
      throw new Error('Invalid OAuth state');
    }

    if (record.codeVerifier && record.codeVerifier !== codeVerifier) {
      throw new Error('Invalid PKCE verifier');
    }

    if (!code.startsWith('valid-')) {
      throw new Error('OAuth authentication failed');
    }

    return {
      providerAccountId: code.slice('valid-'.length),
      email: `${code.slice('valid-'.length)}@oauth.example.com`,
      emailVerified: true,
    };
  }
}

function randomVerifier(): string {
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64url');
}
