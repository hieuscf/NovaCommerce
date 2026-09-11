import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { Role } from '../../domain/entities/role';

export interface CreateRoleCommand {
  readonly name: string;
  readonly description?: string;
  readonly actorId: string;
}

export class CreateRoleHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute(command: CreateRoleCommand): Promise<Result<{ id: string; name: string }, IdentityApplicationError>> {
    const canCreate = await this.authorizationService.can(command.actorId, 'identity:role:create');
    if (!canCreate) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    const existing = await this.roleRepository.findByName(command.name);
    if (existing) {
      return Result.fail(new IdentityApplicationError('Role already exists', 'ROLE_ALREADY_EXISTS'));
    }

    const role = Role.create(randomUUID(), command.name, command.description);
    await this.roleRepository.save(role);

    return Result.ok({ id: role.id, name: role.getName() });
  }
}
