import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserPreferenceResponseDto } from '../dto/user-response.dto';
import { mapUserPreferenceToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';
import { PreferenceKey } from '../../domain/value-objects/preference-key';

export interface UpdateCustomerPreferencesCommand {
  readonly identityId: string;
  readonly preferences: ReadonlyArray<{ readonly key: string; readonly value: string }>;
}

export class UpdateCustomerPreferencesHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    command: UpdateCustomerPreferencesCommand,
  ): Promise<Result<UserPreferenceResponseDto[], UserApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      if (command.preferences.length === 0) {
        return Result.fail(new UserApplicationError('No preferences to update', 'NO_PREFERENCE_CHANGES'));
      }

      for (const item of command.preferences) {
        const key = PreferenceKey.create(item.key);
        const upsertResult = user.upsertPreference(key, item.value, randomUUID());
        if (upsertResult.isFailure) {
          return Result.fail(
            new UserApplicationError(upsertResult.getError().message, upsertResult.getError().code),
          );
        }
      }

      await this.userRepository.save(user);
      return Result.ok(user.getPreferences().map((preference) => mapUserPreferenceToDto(preference)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update preferences';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'UPDATE_PREFERENCES_FAILED';
      return Result.fail(new UserApplicationError(message, code));
    }
  }
}
