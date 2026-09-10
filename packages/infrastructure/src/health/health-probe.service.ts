export type DependencyStatus = 'up' | 'down';

export interface DependencyChecks {
  readonly database: DependencyStatus;
  readonly redis: DependencyStatus;
  readonly opensearch: DependencyStatus;
  readonly minio: DependencyStatus;
}

export interface ReadinessResult {
  readonly status: 'ok' | 'degraded';
  readonly checks: DependencyChecks;
}

export interface DependencyProbes {
  database(): Promise<void>;
  redis(): Promise<void>;
  opensearch(): Promise<void>;
  minio(): Promise<void>;
}

export class HealthProbeService {
  constructor(private readonly probes: DependencyProbes) {}

  async checkReadiness(): Promise<ReadinessResult> {
    const [database, redis, opensearch, minio] = await Promise.all([
      this.runProbe(this.probes.database),
      this.runProbe(this.probes.redis),
      this.runProbe(this.probes.opensearch),
      this.runProbe(this.probes.minio),
    ]);

    const checks: DependencyChecks = {
      database,
      redis,
      opensearch,
      minio,
    };

    const allUp = Object.values(checks).every((status) => status === 'up');

    return {
      status: allUp ? 'ok' : 'degraded',
      checks,
    };
  }

  private async runProbe(probe: () => Promise<void>): Promise<DependencyStatus> {
    try {
      await probe();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
