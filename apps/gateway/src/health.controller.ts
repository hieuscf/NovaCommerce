import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { SkipEnvelope } from './common/decorators/skip-envelope.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Liveness probe' })
  check(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
