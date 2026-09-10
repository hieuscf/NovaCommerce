import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SecurityContext } from '@novacommerce/building-blocks';

interface AccessTokenPayload {
  readonly sub: string;
  readonly roles?: string[];
  readonly permissions?: string[];
}

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateAccessToken(token: string): Promise<SecurityContext | null> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      if (!payload.sub) {
        return null;
      }

      return {
        userId: payload.sub,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      };
    } catch {
      return null;
    }
  }

  createAccessToken(context: SecurityContext): string {
    return this.jwtService.sign({
      sub: context.userId,
      roles: [...context.roles],
      permissions: [...context.permissions],
    });
  }
}
