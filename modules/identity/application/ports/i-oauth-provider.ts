export interface OAuthAuthorizationRequest {
  readonly authorizationUrl: string;
  readonly state: string;
  readonly codeVerifier?: string;
}

export interface OAuthTokenExchangeResult {
  readonly providerAccountId: string;
  readonly email?: string;
  readonly emailVerified: boolean;
}

export interface IOAuthProvider {
  readonly providerName: string;
  createAuthorizationRequest(redirectUri: string): Promise<OAuthAuthorizationRequest>;
  exchangeCode(
    code: string,
    redirectUri: string,
    state: string,
    codeVerifier?: string,
  ): Promise<OAuthTokenExchangeResult>;
}
