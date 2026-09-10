import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { SkipEnvelope } from './common/decorators/skip-envelope.decorator';
import { PrismaService } from './infrastructure/database/prisma.service';

@ApiTags('Health')
@Controller('ready')
export class ReadyController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Readiness probe (database connectivity)' })
  async check(): Promise<{ status: string; service: string; timestamp: string }> {
    try {
      await this.prisma.ping();
    } catch {
      throw new ServiceUnavailableException('Database is unavailable');
    }

    return {
      status: 'ready',
      service: 'gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
