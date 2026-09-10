import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from '../constants';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const headerRequestId = request.headers[REQUEST_ID_HEADER];
    const headerCorrelationId = request.headers[CORRELATION_ID_HEADER];

    request.requestId =
      typeof headerRequestId === 'string' && headerRequestId.length > 0
        ? headerRequestId
        : randomUUID();

    request.correlationId =
      typeof headerCorrelationId === 'string' && headerCorrelationId.length > 0
        ? headerCorrelationId
        : request.requestId;

    return next.handle();
  }
}
