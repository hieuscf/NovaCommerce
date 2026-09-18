import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { AssignPermissionToRoleHandler } from '../../../../../modules/identity/application/handlers/assign-permission-to-role.handler';
import { AssignRoleHandler } from '../../../../../modules/identity/application/handlers/assign-role.handler';
import { CreateRoleHandler } from '../../../../../modules/identity/application/handlers/create-role.handler';
import { DeleteRoleHandler } from '../../../../../modules/identity/application/handlers/delete-role.handler';
import { DuplicateRoleHandler } from '../../../../../modules/identity/application/handlers/duplicate-role.handler';
import { ListRoleMembersHandler } from '../../../../../modules/identity/application/handlers/list-role-members.handler';
import { ListRolesHandler } from '../../../../../modules/identity/application/handlers/list-roles.handler';
import { RevokePermissionFromRoleHandler } from '../../../../../modules/identity/application/handlers/revoke-permission-from-role.handler';
import { RevokeRoleHandler } from '../../../../../modules/identity/application/handlers/revoke-role.handler';
import { UpdateRoleHandler } from '../../../../../modules/identity/application/handlers/update-role.handler';
import { UpdateRolePermissionsHandler } from '../../../../../modules/identity/application/handlers/update-role-permissions.handler';
import { IDENTITY_TOKENS } from '../../../../../modules/identity/contracts/tokens';
import type { IPermissionRepository } from '../../../../../modules/identity/domain/repositories/i-permission-repository';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssignPermissionRequestDto } from '../dto/assign-permission-request.dto';
import { AssignRoleRequestDto } from '../dto/assign-role-request.dto';
import { CreateRoleRequestDto } from '../dto/create-role-request.dto';
import { DuplicateRoleRequestDto } from '../dto/duplicate-role-request.dto';
import { RevokePermissionQueryDto } from '../dto/revoke-permission-query.dto';
import { UpdateRolePermissionsRequestDto } from '../dto/update-role-permissions-request.dto';
import { UpdateRoleRequestDto } from '../dto/update-role-request.dto';
import { mapIdentityResult } from '../utils/map-identity-result';

@ApiTags('roles')
@Controller()
export class RolesController {
  constructor(
    private readonly listRolesHandler: ListRolesHandler,
    private readonly listRoleMembersHandler: ListRoleMembersHandler,
    private readonly createRoleHandler: CreateRoleHandler,
    private readonly updateRoleHandler: UpdateRoleHandler,
    private readonly deleteRoleHandler: DeleteRoleHandler,
    private readonly duplicateRoleHandler: DuplicateRoleHandler,
    private readonly assignRoleHandler: AssignRoleHandler,
    private readonly revokeRoleHandler: RevokeRoleHandler,
    private readonly assignPermissionHandler: AssignPermissionToRoleHandler,
    private readonly updateRolePermissionsHandler: UpdateRolePermissionsHandler,
    private readonly revokePermissionHandler: RevokePermissionFromRoleHandler,
    @Inject(IDENTITY_TOKENS.PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  @Get('roles')
  @ApiOperation({ summary: 'List roles with membership counts' })
  async listRoles() {
    return this.listRolesHandler.execute();
  }

  @Get('roles/:roleId/users')
  @ApiOperation({ summary: 'List identities assigned to a role' })
  async listRoleMembers(@Param('roleId') roleId: string) {
    return mapIdentityResult(await this.listRoleMembersHandler.execute({ roleId }));
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

  @Patch('roles/:roleId')
  @ApiOperation({ summary: 'Update role name or description' })
  async updateRole(
    @CurrentUser() user: SecurityContext,
    @Param('roleId') roleId: string,
    @Body() body: UpdateRoleRequestDto,
  ) {
    return mapIdentityResult(
      await this.updateRoleHandler.execute({
        roleId,
        name: body.name,
        description: body.description,
        actorId: user.userId,
      }),
    );
  }

  @Delete('roles/:roleId')
  @ApiOperation({ summary: 'Delete a custom role' })
  async deleteRole(@CurrentUser() user: SecurityContext, @Param('roleId') roleId: string) {
    return mapIdentityResult(
      await this.deleteRoleHandler.execute({
        roleId,
        actorId: user.userId,
      }),
    );
  }

  @Post('roles/:roleId/duplicate')
  @ApiOperation({ summary: 'Duplicate a role and its permissions' })
  async duplicateRole(
    @CurrentUser() user: SecurityContext,
    @Param('roleId') roleId: string,
    @Body() body: DuplicateRoleRequestDto,
  ) {
    return mapIdentityResult(
      await this.duplicateRoleHandler.execute({
        roleId,
        name: body.name,
        description: body.description,
        actorId: user.userId,
      }),
    );
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

  @Patch('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Grant or revoke one or more permissions on a role' })
  async updatePermissions(
    @CurrentUser() user: SecurityContext,
    @Param('roleId') roleId: string,
    @Body() body: UpdateRolePermissionsRequestDto,
  ) {
    return mapIdentityResult(
      await this.updateRolePermissionsHandler.execute({
        roleId,
        changes: body.changes,
        actorId: user.userId,
      }),
    );
  }

  @Delete('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Revoke permission from role' })
  async revokePermission(
    @CurrentUser() user: SecurityContext,
    @Param('roleId') roleId: string,
    @Query() query: RevokePermissionQueryDto,
  ) {
    return mapIdentityResult(
      await this.revokePermissionHandler.execute({
        roleId,
        permissionKey: query.key,
        actorId: user.userId,
      }),
    );
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
