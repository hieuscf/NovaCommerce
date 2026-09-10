import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ApiExceptionFilter } from './api-exception.filter';
import type { AuthenticatedRequest } from '../types/authenticated-request';

function createHost(request: Partial<AuthenticatedRequest> = {}) {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({
        requestId: 'req-1',
        method: 'GET',
        url: '/api/v1/test',
        ...request,
      }),
    }),
    response,
  };
}

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();

  it('maps validation errors to VALIDATION_ERROR', () => {
    const host = createHost();
    filter.catch(new BadRequestException({ message: ['message is required'] }), host as never);

    expect(host.response.statusCode).toBe(400);
    expect(host.response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'message is required',
        details: { fields: ['message is required'] },
        requestId: 'req-1',
      },
    });
  });

  it('maps not found errors to NOT_FOUND', () => {
    const host = createHost();
    filter.catch(new NotFoundException('Resource missing'), host as never);

    expect(host.response.statusCode).toBe(404);
    expect(host.response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource missing',
        requestId: 'req-1',
      },
    });
  });
});
