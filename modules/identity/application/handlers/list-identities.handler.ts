import { Result } from '@novacommerce/building-blocks';
import type { IdentityAccountListResultDto } from '../dto/identity-account-list.dto';
import { IdentityApplicationError } from '../errors/identity-application.error';
import { mapIdentityAccountToListItem } from '../mappers/map-identity-account';
import type { IAuthorizationService } from '../ports/i-authorization-service';
import type {
  IIdentityRepository,
  IdentityAccountRoleFilter,
  IdentityAccountStatusFilter,
} from '../../domain/repositories/i-identity-repository';

export interface ListIdentitiesQuery {
  readonly q?: string;
  readonly role?: IdentityAccountRoleFilter;
  readonly status?: IdentityAccountStatusFilter;
  readonly page: number;
  readonly pageSize: number;
  readonly actorId: string;
}

export class ListIdentitiesHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute(
    query: ListIdentitiesQuery,
  ): Promise<Result<IdentityAccountListResultDto, IdentityApplicationError>> {
    const canView = await this.authorizationService.can(query.actorId, 'identity:account:view');
    if (!canView) {
      return Result.fail(new IdentityApplicationError('Permission denied', 'PERMISSION_DENIED'));
    }

    const page = Math.max(1, query.page);
    const pageSize = Math.min(100, Math.max(1, query.pageSize));
    const result = await this.identityRepository.searchAccounts({
      q: query.q,
      role: query.role,
      status: query.status,
      page,
      pageSize,
    });

    return Result.ok({
      items: result.items.map(mapIdentityAccountToListItem),
      total: result.total,
      page,
      pageSize,
      summary: result.summary,
    });
  }
}
