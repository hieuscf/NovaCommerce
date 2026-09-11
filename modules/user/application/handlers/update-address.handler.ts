import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserAddressResponseDto } from '../dto/user-response.dto';
import { mapUserAddressToDto } from '../mappers/map-user-to-dto';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';
import { Address } from '../../domain/value-objects/address';

export interface UpdateAddressCommand {
  readonly identityId: string;
  readonly addressId: string;
  readonly label: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
}

export class UpdateAddressHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateAddressCommand): Promise<Result<UserAddressResponseDto, UserApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new UserApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const address = Address.create({
        line1: command.line1,
        line2: command.line2,
        city: command.city,
        state: command.state,
        postalCode: command.postalCode,
        country: command.country,
      });

      const updateResult = user.updateAddress(command.addressId, command.label, address);
      if (updateResult.isFailure) {
        return Result.fail(new UserApplicationError(updateResult.getError().message, updateResult.getError().code));
      }

      await this.userRepository.save(user);

      const updated = user.getAddresses().find((item) => item.id === command.addressId);
      if (!updated) {
        return Result.fail(new UserApplicationError('Address not found', 'ADDRESS_NOT_FOUND'));
      }

      return Result.ok(mapUserAddressToDto(updated));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update address';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'UPDATE_ADDRESS_FAILED';
      return Result.fail(new UserApplicationError(message, code));
    }
  }
}
