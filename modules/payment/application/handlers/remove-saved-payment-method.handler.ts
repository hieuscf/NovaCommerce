import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { ISavedPaymentMethodRepository } from '../../domain/repositories/i-saved-payment-method-repository';
import { PaymentApplicationError } from '../errors/payment-application.error';

export interface RemoveSavedPaymentMethodCommand {
  readonly identityId: string;
  readonly paymentMethodId: string;
}

export class RemoveSavedPaymentMethodHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly savedPaymentMethodRepository: ISavedPaymentMethodRepository,
  ) {}

  async execute(command: RemoveSavedPaymentMethodCommand): Promise<Result<void, PaymentApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new PaymentApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const method = await this.savedPaymentMethodRepository.findById(command.paymentMethodId);
      if (!method || method.getCustomerId() !== user.id) {
        return Result.fail(new PaymentApplicationError('Payment method not found', 'PAYMENT_METHOD_NOT_FOUND'));
      }

      const wasDefault = method.getIsDefault();
      method.markRemoved();
      await this.savedPaymentMethodRepository.delete(method);

      if (wasDefault) {
        const remaining = await this.savedPaymentMethodRepository.findByCustomerId(user.id);
        const next = remaining[0];
        if (next) {
          next.markDefault();
          await this.savedPaymentMethodRepository.save(next);
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove payment method';
      return Result.fail(new PaymentApplicationError(message, 'REMOVE_SAVED_PAYMENT_METHOD_FAILED'));
    }
  }
}
