import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SecurityContextDto } from '../../common/dto/security-context.dto';

@ApiTags('Identity')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  @Get()
  @ApiOperation({ summary: 'Get authenticated principal' })
  getMe(@CurrentUser() user: SecurityContext): SecurityContextDto {
    return {
      userId: user.userId,
      roles: [...user.roles],
      permissions: [...user.permissions],
    };
  }
}
