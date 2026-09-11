import type { SecurityContext } from '@novacommerce/building-blocks';
import type {
  AccessTokenResult,
  IAccessTokenService,
} from '../../application/ports/i-access-token-service';

export interface JwtSigner {
  sign(payload: Record<string, unknown>): string;
}

export class JwtAccessTokenService implements IAccessTokenService {
  constructor(
    private readonly jwtSigner: JwtSigner,
    private readonly expiresInSeconds: number,
  ) {}

  issue(context: SecurityContext): AccessTokenResult {
    return {
      accessToken: this.jwtSigner.sign({
        sub: context.userId,
        roles: [...context.roles],
        permissions: [...context.permissions],
      }),
      expiresIn: this.expiresInSeconds,
    };
  }
}
