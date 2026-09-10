import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { SecurityContext } from '@novacommerce/building-blocks';
import type { AuthenticatedRequest } from '../types/authenticated-request';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SecurityContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.securityContext) {
      throw new UnauthorizedException('Authenticated principal is unavailable');
    }

    return request.securityContext;
  },
);
