export interface RefreshTokenIssueResult {
  readonly rawToken: string;
  readonly tokenHash: string;
  readonly sessionId: string;
  readonly expiresAt: Date;
}

export interface IRefreshTokenStore {
  issue(): RefreshTokenIssueResult;
  hash(rawToken: string): string;
}
