import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { SavedPaymentMethod } from '../../domain/aggregates/saved-payment-method';
import type { ISavedPaymentMethodRepository } from '../../domain/repositories/i-saved-payment-method-repository';
import type { SavedPaymentMethodResponseDto } from '../dto/saved-payment-method-response.dto';
import { PaymentApplicationError } from '../errors/payment-application.error';
import { mapSavedPaymentMethodToDto } from '../mappers/map-saved-payment-method-to-dto';

export interface SetDefaultSavedPaymentMethodCommand {
  readonly identityId: string;
  readonly paymentMethodId: string;
}

export class SetDefaultSavedPaymentMethodHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly savedPaymentMethodRepository: ISavedPaymentMethodRepository,
  ) {}

  async execute(
    command: SetDefaultSavedPaymentMethodCommand,
  ): Promise<Result<SavedPaymentMethodResponseDto, PaymentApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new PaymentApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const methods = await this.savedPaymentMethodRepository.findByCustomerId(user.id);
      const target = methods.find((method) => method.id === command.paymentMethodId);
      if (!target) {
        return Result.fail(new PaymentApplicationError('Payment method not found', 'PAYMENT_METHOD_NOT_FOUND'));
      }

      const toSave: SavedPaymentMethod[] = [];
      for (const method of methods) {
        if (method.id === target.id) {
          method.markDefault();
          toSave.push(method);
        } else if (method.getIsDefault()) {
          method.clearDefault();
          toSave.push(method);
        }
      }

      await this.savedPaymentMethodRepository.saveMany(toSave);
      return Result.ok(mapSavedPaymentMethodToDto(target));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set default payment method';
      return Result.fail(new PaymentApplicationError(message, 'SET_DEFAULT_PAYMENT_METHOD_FAILED'));
    }
  }
}
