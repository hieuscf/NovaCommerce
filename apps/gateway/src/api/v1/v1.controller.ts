import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ApiRootResponseDto } from '../../common/dto/api-root-response.dto';

@ApiTags('API')
@Controller()
export class V1Controller {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get API v1 root metadata' })
  getRoot(): ApiRootResponseDto {
    return {
      name: 'NovaCommerce API',
      version: 'v1',
      status: 'operational',
    };
  }
}
