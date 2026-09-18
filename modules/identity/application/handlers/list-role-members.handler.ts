import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { RoleMemberDto } from '../dto/role-list-item.dto';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';

export interface ListRoleMembersQuery {
  readonly roleId: string;
}

export class ListRoleMembersHandler {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly identityRepository: IIdentityRepository,
  ) {}

  async execute(
    query: ListRoleMembersQuery,
  ): Promise<Result<RoleMemberDto[], IdentityApplicationError>> {
    const role = await this.roleRepository.findById(query.roleId);
    if (!role) {
      return Result.fail(new IdentityApplicationError('Role not found', 'ROLE_NOT_FOUND'));
    }

    const members = await this.identityRepository.findMembersByRoleId(role.id);
    return Result.ok(
      members.map((member) => ({
        id: member.id,
        email: member.email,
        status: member.status,
        createdAt: member.createdAt.toISOString(),
      })),
    );
  }
}
