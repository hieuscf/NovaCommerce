import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';

export interface DeleteRoleCommand {
  readonly roleId: string;
  readonly actorId: string;
}

export class DeleteRoleHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<Result<void, IdentityApplicationError>> {
    const canDelete = await this.authorizationService.can(command.actorId, 'identity:role:delete');
    if (!canDelete) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      return Result.fail(new IdentityApplicationError('Role not found', 'ROLE_NOT_FOUND'));
    }

    const deletable = role.assertDeletable();
    if (deletable.isFailure) {
      return Result.fail(
        new IdentityApplicationError(deletable.getError().message, deletable.getError().code),
      );
    }

    await this.roleRepository.delete(role.id);
    return Result.ok(undefined);
  }
}
