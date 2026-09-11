import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { UserApplicationError } from '../errors/user-application.error';
import type { UserAddressResponseDto } from '../dto/user-response.dto';
import { mapUserAddressToDto } from '../mappers/map-user-to-dto';
import { UserAddress } from '../../domain/entities/user-address';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';
import { Address } from '../../domain/value-objects/address';

export interface AddAddressCommand {
  readonly identityId: string;
  readonly label: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault?: boolean;
}

export class AddAddressHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: AddAddressCommand): Promise<Result<UserAddressResponseDto, UserApplicationError>> {
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

      const userAddress = UserAddress.create(randomUUID(), command.label, address, command.isDefault ?? false);
      const addResult = user.addAddress(userAddress);
      if (addResult.isFailure) {
        return Result.fail(new UserApplicationError(addResult.getError().message, addResult.getError().code));
      }

      await this.userRepository.save(user);
      return Result.ok(mapUserAddressToDto(userAddress));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add address';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'ADD_ADDRESS_FAILED';
      return Result.fail(new UserApplicationError(message, code));
    }
  }
}
