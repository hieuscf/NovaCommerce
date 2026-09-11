import { Body, Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { IDENTITY_TOKENS } from '../../../../../modules/identity/contracts/tokens';
import { AssignPermissionToRoleHandler } from '../../../../../modules/identity/application/handlers/assign-permission-to-role.handler';
import { AssignRoleHandler } from '../../../../../modules/identity/application/handlers/assign-role.handler';
import { CreateRoleHandler } from '../../../../../modules/identity/application/handlers/create-role.handler';
import { RevokeRoleHandler } from '../../../../../modules/identity/application/handlers/revoke-role.handler';
import type { IPermissionRepository } from '../../../../../modules/identity/domain/repositories/i-permission-repository';
import type { IRoleRepository } from '../../../../../modules/identity/domain/repositories/i-role-repository';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssignPermissionRequestDto } from '../dto/assign-permission-request.dto';
import { AssignRoleRequestDto } from '../dto/assign-role-request.dto';
import { CreateRoleRequestDto } from '../dto/create-role-request.dto';
import { mapIdentityResult } from '../utils/map-identity-result';

@ApiTags('roles')
@Controller()
export class RolesController {
  constructor(
    private readonly createRoleHandler: CreateRoleHandler,
    private readonly assignRoleHandler: AssignRoleHandler,
    private readonly revokeRoleHandler: RevokeRoleHandler,
    private readonly assignPermissionHandler: AssignPermissionToRoleHandler,
    @Inject(IDENTITY_TOKENS.ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(IDENTITY_TOKENS.PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  @Get('roles')
  @ApiOperation({ summary: 'List roles' })
  async listRoles() {
    const roles = await this.roleRepository.findAll();
    return roles.map((role) => ({
      id: role.id,
      name: role.getName(),
      description: role.getDescription(),
      permissions: role.getPermissionKeys().map((key) => key.value),
    }));
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create role' })
  async createRole(@CurrentUser() user: SecurityContext, @Body() body: CreateRoleRequestDto) {
    const result = await this.createRoleHandler.execute({
      name: body.name,
      description: body.description,
      actorId: user.userId,
    });
    return mapIdentityResult(result);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List permissions' })
  async listPermissions() {
    const permissions = await this.permissionRepository.findAll();
    return permissions.map((permission) => ({
      id: permission.id,
      key: permission.getKey().value,
    }));
  }

  @Post('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Assign permission to role' })
  async assignPermission(
    @CurrentUser() user: SecurityContext,
    @Param('roleId') roleId: string,
    @Body() body: AssignPermissionRequestDto,
  ) {
    const result = await this.assignPermissionHandler.execute({
      roleId,
      permissionKey: body.permissionKey,
      actorId: user.userId,
    });
    return mapIdentityResult(result);
  }

  @Post('users/:identityId/roles')
  @ApiOperation({ summary: 'Assign role to identity' })
  async assignRole(
    @CurrentUser() user: SecurityContext,
    @Param('identityId') identityId: string,
    @Body() body: AssignRoleRequestDto,
  ) {
    const result = await this.assignRoleHandler.execute({
      identityId,
      roleId: body.roleId,
      actorId: user.userId,
    });
    return mapIdentityResult(result);
  }

  @Delete('users/:identityId/roles/:roleId')
  @ApiOperation({ summary: 'Revoke role from identity' })
  async revokeRole(
    @CurrentUser() user: SecurityContext,
    @Param('identityId') identityId: string,
    @Param('roleId') roleId: string,
  ) {
    const result = await this.revokeRoleHandler.execute({
      identityId,
      roleId,
      actorId: user.userId,
    });
    return mapIdentityResult(result);
  }
}
