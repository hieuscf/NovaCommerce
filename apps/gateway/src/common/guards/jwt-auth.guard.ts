import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { JwtAuthService } from '../../auth/jwt-auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly reflector = new Reflector();

  constructor(private readonly jwtAuthService: JwtAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const securityContext = await this.jwtAuthService.validateAccessToken(token);

    if (!securityContext) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.securityContext = securityContext;
    return true;
  }
}
