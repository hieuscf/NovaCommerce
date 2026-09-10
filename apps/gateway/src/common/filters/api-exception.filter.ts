import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DomainError } from '@novacommerce/building-blocks';
import type { Response } from 'express';
import { ApiErrorCode } from '../errors/api-error-code';
import type { AuthenticatedRequest } from '../types/authenticated-request';

interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<AuthenticatedRequest>();
    const requestId = request.requestId ?? 'unknown';

    const { status, body } = this.mapException(exception, requestId);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unhandled error [${requestId}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({ error: body });
  }

  private mapException(
    exception: unknown,
    requestId: string,
  ): { status: number; body: ApiErrorBody } {
    if (exception instanceof DomainError) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        body: {
          code: exception.code,
          message: exception.message,
          requestId,
        },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const details = this.extractDetails(response);
      const message = this.extractMessage(response, exception.message);

      return {
        status,
        body: {
          code: this.mapStatusToCode(status),
          message,
          details,
          requestId,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        requestId,
      },
    };
  }

  private extractMessage(response: string | object, fallback: string): string {
    if (typeof response === 'string') {
      return response;
    }

    if ('message' in response) {
      const message = response.message;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }

    return fallback;
  }

  private extractDetails(response: string | object): Record<string, unknown> | undefined {
    if (typeof response !== 'object' || response === null) {
      return undefined;
    }

    if ('details' in response && typeof response.details === 'object' && response.details !== null) {
      return response.details as Record<string, unknown>;
    }

    if ('message' in response && Array.isArray(response.message)) {
      return { fields: response.message };
    }

    return undefined;
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ApiErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.UNAUTHENTICATED;
      case HttpStatus.FORBIDDEN:
        return ApiErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ApiErrorCode.RATE_LIMITED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ApiErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ApiErrorCode.INTERNAL_ERROR;
    }
  }
}
