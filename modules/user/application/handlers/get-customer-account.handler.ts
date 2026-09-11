import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserAccountResponseDto } from '../dto/user-response.dto';
import { mapUserAccountToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';

export interface GetCustomerAccountQuery {
  readonly identityId: string;
}

export class GetCustomerAccountHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    query: GetCustomerAccountQuery,
  ): Promise<Result<UserAccountResponseDto, UserApplicationError>> {
    const user = await this.userRepository.findByIdentityId(query.identityId);
    if (!user) {
      return Result.fail(new UserApplicationError('Customer account not found', 'USER_NOT_FOUND'));
    }

    return Result.ok(mapUserAccountToDto(user));
  }
}
