import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { SKIP_ENVELOPE_KEY } from '../decorators/skip-envelope.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  private readonly reflector = new Reflector();

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skipEnvelope = this.reflector.getAllAndOverride<boolean>(SKIP_ENVELOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipEnvelope) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return next.handle().pipe(
      map((data: unknown) => {
        if (this.isAlreadyEnveloped(data)) {
          return data;
        }

        return {
          data,
          meta: {
            requestId: request.requestId,
            correlationId: request.correlationId,
          },
        };
      }),
    );
  }

  private isAlreadyEnveloped(data: unknown): data is { data: unknown; meta: unknown } {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      'meta' in data
    );
  }
}
