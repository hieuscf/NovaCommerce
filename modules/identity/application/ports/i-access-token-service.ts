import type { SecurityContext } from '@novacommerce/building-blocks';

export interface AccessTokenResult {
  readonly accessToken: string;
  readonly expiresIn: number;
}

export interface IAccessTokenService {
  issue(context: SecurityContext): AccessTokenResult;
}
