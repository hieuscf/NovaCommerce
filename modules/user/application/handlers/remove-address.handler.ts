import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';

export interface RemoveAddressCommand {
  readonly identityId: string;
  readonly addressId: string;
}

export class RemoveAddressHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: RemoveAddressCommand): Promise<Result<void, UserApplicationError>> {
    const user = await this.userRepository.findByIdentityId(command.identityId);
    if (!user) {
      return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
    }

    const removeResult = user.removeAddress(command.addressId);
    if (removeResult.isFailure) {
      return Result.fail(new UserApplicationError(removeResult.getError().message, removeResult.getError().code));
    }

    await this.userRepository.save(user);
    return Result.ok(undefined);
  }
}
