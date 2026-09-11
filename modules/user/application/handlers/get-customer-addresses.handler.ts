import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserAddressResponseDto } from '../dto/user-response.dto';
import { mapUserAddressToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';

export interface GetCustomerAddressesQuery {
  readonly identityId: string;
}

export class GetCustomerAddressesHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    query: GetCustomerAddressesQuery,
  ): Promise<Result<UserAddressResponseDto[], UserApplicationError>> {
    const user = await this.userRepository.findByIdentityId(query.identityId);
    if (!user) {
      return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
    }

    return Result.ok(user.getAddresses().map((address) => mapUserAddressToDto(address)));
  }
}
