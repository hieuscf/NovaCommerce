import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SecurityContext } from '@novacommerce/building-blocks';

interface AuthenticatedRequest {
  securityContext?: SecurityContext;
}

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SecurityContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.securityContext) {
      throw new Error('Security context is missing');
    }
    return request.securityContext;
  },
);
