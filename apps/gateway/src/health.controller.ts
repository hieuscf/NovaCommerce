import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthProbeService } from '@novacommerce/infrastructure';
import { Public } from './common/decorators/public.decorator';
import { SkipEnvelope } from './common/decorators/skip-envelope.decorator';

interface LivenessResponse {
  status: string;
  service: string;
  timestamp: string;
}

interface ReadinessResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  checks: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    opensearch: 'up' | 'down';
    minio: 'up' | 'down';
  };
}

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthProbeService: HealthProbeService) {}

  @Get('health')
  @Public()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Liveness probe (backward compatible)' })
  check(): LivenessResponse {
    return this.buildLivenessResponse();
  }

  @Get('health/live')
  @Public()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Liveness probe' })
  live(): LivenessResponse {
    return this.buildLivenessResponse();
  }

  @Get('ready')
  @Public()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Readiness probe (all infrastructure dependencies)' })
  async checkReady(): Promise<ReadinessResponse> {
    return this.buildReadinessResponse();
  }

  @Get('health/ready')
  @Public()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Readiness probe alias' })
  async checkHealthReady(): Promise<ReadinessResponse> {
    return this.buildReadinessResponse();
  }

  private buildLivenessResponse(): LivenessResponse {
    return {
      status: 'ok',
      service: 'gateway',
      timestamp: new Date().toISOString(),
    };
  }

  private async buildReadinessResponse(): Promise<ReadinessResponse> {
    const result = await this.healthProbeService.checkReadiness();

    if (result.status === 'degraded') {
      throw new ServiceUnavailableException({
        status: result.status,
        service: 'gateway',
        timestamp: new Date().toISOString(),
        checks: result.checks,
      });
    }

    return {
      status: result.status,
      service: 'gateway',
      timestamp: new Date().toISOString(),
      checks: result.checks,
    };
  }
}
