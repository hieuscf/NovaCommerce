import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { ListIdentitiesHandler } from '../../../../../modules/identity/application/handlers/list-identities.handler';
import { UpdateIdentityLockHandler } from '../../../../../modules/identity/application/handlers/update-identity-lock.handler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListIdentitiesQueryDto } from '../dto/list-identities-query.dto';
import { UpdateIdentityLockRequestDto } from '../dto/update-identity-lock-request.dto';
import { mapIdentityResult } from '../utils/map-identity-result';

@ApiTags('identities')
@Controller()
export class IdentitiesController {
  constructor(
    private readonly listIdentitiesHandler: ListIdentitiesHandler,
    private readonly updateIdentityLockHandler: UpdateIdentityLockHandler,
  ) {}

  @Get('identities')
  @ApiOperation({ summary: 'List identities for admin account management' })
  async listIdentities(@CurrentUser() user: SecurityContext, @Query() query: ListIdentitiesQueryDto) {
    return mapIdentityResult(
      await this.listIdentitiesHandler.execute({
        actorId: user.userId,
        q: query.q,
        role: query.role,
        status: query.status,
        page: query.page,
        pageSize: query.pageSize,
      }),
    );
  }

  @Patch('identities/:identityId')
  @ApiOperation({ summary: 'Lock or unlock an identity account' })
  async updateIdentityLock(
    @CurrentUser() user: SecurityContext,
    @Param('identityId') identityId: string,
    @Body() body: UpdateIdentityLockRequestDto,
  ) {
    return mapIdentityResult(
      await this.updateIdentityLockHandler.execute({
        actorId: user.userId,
        identityId,
        locked: body.locked,
      }),
    );
  }
}
