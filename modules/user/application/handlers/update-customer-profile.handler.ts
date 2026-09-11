import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserProfileResponseDto } from '../dto/user-response.dto';
import { mapUserProfileToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';
import { DisplayName } from '../../domain/value-objects/display-name';
import { PhoneNumber } from '../../domain/value-objects/phone-number';

export interface UpdateCustomerProfileCommand {
  readonly identityId: string;
  readonly displayName?: string;
  readonly phoneNumber?: string | null;
  readonly avatarUrl?: string | null;
}

export class UpdateCustomerProfileHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    command: UpdateCustomerProfileCommand,
  ): Promise<Result<UserProfileResponseDto, UserApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const updateResult = user.updateProfile({
        displayName: command.displayName ? DisplayName.create(command.displayName) : undefined,
        phoneNumber:
          command.phoneNumber === undefined
            ? undefined
            : command.phoneNumber
              ? PhoneNumber.create(command.phoneNumber)
              : null,
        avatarUrl: command.avatarUrl,
      });

      if (updateResult.isFailure) {
        return Result.fail(
          new UserApplicationError(updateResult.getError().message, updateResult.getError().code),
        );
      }

      await this.userRepository.save(user);
      return Result.ok(mapUserProfileToDto(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update customer profile';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'UPDATE_PROFILE_FAILED';
      return Result.fail(new UserApplicationError(message, code));
    }
  }
}
