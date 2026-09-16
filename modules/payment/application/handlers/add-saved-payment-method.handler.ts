import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import { SavedPaymentMethod } from '../../domain/aggregates/saved-payment-method';
import type { ISavedPaymentMethodRepository } from '../../domain/repositories/i-saved-payment-method-repository';
import type { ICardTokenizer } from '../contracts/card-tokenizer.contract';
import type { SavedPaymentMethodResponseDto } from '../dto/saved-payment-method-response.dto';
import { PaymentApplicationError } from '../errors/payment-application.error';
import { mapSavedPaymentMethodToDto } from '../mappers/map-saved-payment-method-to-dto';

export interface AddSavedPaymentMethodCommand {
  readonly identityId: string;
  readonly cardNumber: string;
  readonly cardholderName: string;
  readonly expMonth: number;
  readonly expYear: number;
  readonly isDefault?: boolean;
  /** Explicitly rejected — CVV must never reach persistence (ADR-006). */
  readonly cvv?: never;
  readonly cvc?: never;
}

export class AddSavedPaymentMethodHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly savedPaymentMethodRepository: ISavedPaymentMethodRepository,
    private readonly cardTokenizer: ICardTokenizer,
  ) {}

  async execute(
    command: AddSavedPaymentMethodCommand,
  ): Promise<Result<SavedPaymentMethodResponseDto, PaymentApplicationError>> {
    try {
      if ('cvv' in command || 'cvc' in command) {
        return Result.fail(
          new PaymentApplicationError('CVV/CVC must not be submitted when saving a card', 'CVV_NOT_ALLOWED'),
        );
      }

      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new PaymentApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const tokenized = this.cardTokenizer.tokenize({
        cardNumber: command.cardNumber,
        expMonth: command.expMonth,
        expYear: command.expYear,
        cardholderName: command.cardholderName,
      });

      const existing = await this.savedPaymentMethodRepository.findByCustomerId(user.id);
      const makeDefault = command.isDefault === true || existing.length === 0;

      const created = SavedPaymentMethod.create({
        id: randomUUID(),
        customerId: user.id,
        provider: tokenized.provider,
        providerToken: tokenized.providerToken,
        brand: tokenized.brand,
        last4: tokenized.last4,
        expMonth: command.expMonth,
        expYear: command.expYear,
        cardholderName: command.cardholderName,
        isDefault: makeDefault,
      });
      if (created.isFailure) {
        return Result.fail(
          new PaymentApplicationError(created.getError().message, created.getError().code),
        );
      }

      const method = created.getValue();
      const toSave: SavedPaymentMethod[] = [method];

      if (makeDefault) {
        for (const other of existing) {
          if (other.getIsDefault()) {
            other.clearDefault();
            toSave.push(other);
          }
        }
      }

      await this.savedPaymentMethodRepository.saveMany(toSave);
      return Result.ok(mapSavedPaymentMethodToDto(method));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save payment method';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'ADD_SAVED_PAYMENT_METHOD_FAILED';
      return Result.fail(new PaymentApplicationError(message, code));
    }
  }
}
