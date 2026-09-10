import type { Request } from 'express';
import type { SecurityContext } from '@novacommerce/building-blocks';

export interface AuthenticatedRequest extends Request {
  requestId: string;
  correlationId: string;
  securityContext?: SecurityContext;
}
