import { describe, expect, it } from 'vitest';
import { HealthProbeService } from './health-probe.service';

describe('HealthProbeService', () => {
  it('returns ok when all probes succeed', async () => {
    const service = new HealthProbeService({
      database: async () => undefined,
      redis: async () => undefined,
      opensearch: async () => undefined,
      minio: async () => undefined,
    });

    const result = await service.checkReadiness();

    expect(result.status).toBe('ok');
    expect(result.checks).toEqual({
      database: 'up',
      redis: 'up',
      opensearch: 'up',
      minio: 'up',
    });
  });

  it('returns degraded when redis probe fails', async () => {
    const service = new HealthProbeService({
      database: async () => undefined,
      redis: async () => {
        throw new Error('down');
      },
      opensearch: async () => undefined,
      minio: async () => undefined,
    });

    const result = await service.checkReadiness();

    expect(result.status).toBe('degraded');
    expect(result.checks.redis).toBe('down');
  });

  it('returns degraded when multiple probes fail', async () => {
    const service = new HealthProbeService({
      database: async () => {
        throw new Error('down');
      },
      redis: async () => {
        throw new Error('down');
      },
      opensearch: async () => undefined,
      minio: async () => undefined,
    });

    const result = await service.checkReadiness();

    expect(result.status).toBe('degraded');
    expect(result.checks.database).toBe('down');
    expect(result.checks.redis).toBe('down');
  });
});
