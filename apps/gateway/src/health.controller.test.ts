import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';
import { createMockHealthProbeService } from './test/infrastructure-test-utils';

describe('HealthController', () => {
  it('returns liveness payload', () => {
    const controller = new HealthController(createMockHealthProbeService());

    expect(controller.check().status).toBe('ok');
    expect(controller.live().service).toBe('gateway');
  });

  it('returns readiness when all dependencies are up', async () => {
    const controller = new HealthController(createMockHealthProbeService());

    const result = await controller.checkReady();

    expect(result.status).toBe('ok');
    expect(result.checks).toEqual({
      database: 'up',
      redis: 'up',
      opensearch: 'up',
      minio: 'up',
    });
  });

  it('throws 503 when a dependency is down', async () => {
    const controller = new HealthController(
      createMockHealthProbeService({ redis: 'down' }),
    );

    await expect(controller.checkReady()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
