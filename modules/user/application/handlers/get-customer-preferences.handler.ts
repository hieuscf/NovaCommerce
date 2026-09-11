import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserPreferenceResponseDto } from '../dto/user-response.dto';
import { mapUserPreferenceToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';

export interface GetCustomerPreferencesQuery {
  readonly identityId: string;
}

export class GetCustomerPreferencesHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    query: GetCustomerPreferencesQuery,
  ): Promise<Result<UserPreferenceResponseDto[], UserApplicationError>> {
    const user = await this.userRepository.findByIdentityId(query.identityId);
    if (!user) {
      return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
    }

    return Result.ok(user.getPreferences().map((preference) => mapUserPreferenceToDto(preference)));
  }
}
