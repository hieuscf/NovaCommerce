import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { ISavedPaymentMethodRepository } from '../../domain/repositories/i-saved-payment-method-repository';
import type { SavedPaymentMethodResponseDto } from '../dto/saved-payment-method-response.dto';
import { PaymentApplicationError } from '../errors/payment-application.error';
import { mapSavedPaymentMethodToDto } from '../mappers/map-saved-payment-method-to-dto';

export interface ListSavedPaymentMethodsCommand {
  readonly identityId: string;
}

export class ListSavedPaymentMethodsHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly savedPaymentMethodRepository: ISavedPaymentMethodRepository,
  ) {}

  async execute(
    command: ListSavedPaymentMethodsCommand,
  ): Promise<Result<SavedPaymentMethodResponseDto[], PaymentApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new PaymentApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const methods = await this.savedPaymentMethodRepository.findByCustomerId(user.id);
      return Result.ok(methods.map(mapSavedPaymentMethodToDto));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list payment methods';
      return Result.fail(new PaymentApplicationError(message, 'LIST_SAVED_PAYMENT_METHODS_FAILED'));
    }
  }
}
