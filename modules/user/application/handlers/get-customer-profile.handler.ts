import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserProfileResponseDto } from '../dto/user-response.dto';
import { mapUserProfileToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';

export interface GetCustomerProfileQuery {
  readonly identityId: string;
}

export class GetCustomerProfileHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    query: GetCustomerProfileQuery,
  ): Promise<Result<UserProfileResponseDto, UserApplicationError>> {
    const user = await this.userRepository.findByIdentityId(query.identityId);
    if (!user) {
      return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
    }

    return Result.ok(mapUserProfileToDto(user));
  }
}
