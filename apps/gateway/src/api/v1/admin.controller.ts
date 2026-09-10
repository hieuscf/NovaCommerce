import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  @Get('status')
  @RequirePermissions('admin:read')
  @ApiOperation({ summary: 'Get admin status (requires admin:read permission)' })
  getStatus(): { status: string } {
    return { status: 'ok' };
  }
}
