import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserAddressResponseDto } from '../dto/user-response.dto';
import { mapUserAddressToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';

export interface SetDefaultAddressCommand {
  readonly identityId: string;
  readonly addressId: string;
}

export class SetDefaultAddressHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    command: SetDefaultAddressCommand,
  ): Promise<Result<UserAddressResponseDto, UserApplicationError>> {
    const user = await this.userRepository.findByIdentityId(command.identityId);
    if (!user) {
      return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
    }

    const setDefaultResult = user.setDefaultAddress(command.addressId);
    if (setDefaultResult.isFailure) {
      return Result.fail(
        new UserApplicationError(setDefaultResult.getError().message, setDefaultResult.getError().code),
      );
    }

    await this.userRepository.save(user);

    const updated = user.getAddresses().find((item) => item.id === command.addressId);
    if (!updated) {
      return Result.fail(new UserApplicationError('Address not found', 'ADDRESS_NOT_FOUND'));
    }

    return Result.ok(mapUserAddressToDto(updated));
  }
}
