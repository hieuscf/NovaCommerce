import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserProfileResponseDto } from '../dto/user-response.dto';
import { mapUserProfileToDto } from '../mappers/map-user-to-dto';
import { User } from '../../domain/aggregates/user';
import { UserProfile } from '../../domain/entities/user-profile';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';
import { DisplayName } from '../../domain/value-objects/display-name';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { UserId } from '../../domain/value-objects/user-id';

export interface CreateCustomerProfileCommand {
  readonly identityId: string;
  readonly displayName: string;
  readonly phoneNumber?: string;
  readonly avatarUrl?: string;
}

export class CreateCustomerProfileHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    command: CreateCustomerProfileCommand,
  ): Promise<Result<UserProfileResponseDto, UserApplicationError>> {
    try {
      const existing = await this.userRepository.findByIdentityId(command.identityId);
      if (existing) {
        return Result.fail(new UserApplicationError('Customer profile already exists', 'USER_ALREADY_EXISTS'));
      }

      const displayName = DisplayName.create(command.displayName);
      const phoneNumber = command.phoneNumber ? PhoneNumber.create(command.phoneNumber) : undefined;
      const userId = UserId.create(randomUUID());
      const profile = UserProfile.create(randomUUID(), displayName, phoneNumber, command.avatarUrl);

      const createResult = User.create(userId, command.identityId, profile);
      if (createResult.isFailure) {
        return Result.fail(
          new UserApplicationError(createResult.getError().message, createResult.getError().code),
        );
      }

      const user = createResult.getValue();
      await this.userRepository.save(user);

      return Result.ok(mapUserProfileToDto(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create customer profile';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'CREATE_PROFILE_FAILED';
      return Result.fail(new UserApplicationError(message, code));
    }
  }
}
