import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { PaymentTransaction } from '../../domain/entities/payment-transaction';
import type { IPaymentRepository } from '../../domain/repositories/i-payment-repository';
import { ProviderReference } from '../../domain/value-objects/provider-reference';
import type { PaymentResponseDto } from '../dto/payment-response.dto';
import { PaymentApplicationError } from '../errors/payment-application.error';
import { mapPaymentToDto } from '../mappers/map-payment-to-dto';

export interface ConfirmPaymentCommand {
  readonly paymentId: string;
  readonly providerReference: string;
}

export class ConfirmPaymentHandler {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(
    command: ConfirmPaymentCommand,
  ): Promise<Result<PaymentResponseDto, PaymentApplicationError>> {
    try {
      const payment = await this.paymentRepository.findById(command.paymentId);
      if (!payment) {
        return Result.fail(new PaymentApplicationError('Payment not found', 'PAYMENT_NOT_FOUND'));
      }

      const providerReference = ProviderReference.create(command.providerReference);
      const transaction = PaymentTransaction.create(
        randomUUID(),
        payment.getAmount(),
        providerReference,
      );

      const confirmResult = payment.markSucceeded(transaction);
      if (confirmResult.isFailure) {
        return Result.fail(
          new PaymentApplicationError(confirmResult.getError().message, confirmResult.getError().code),
        );
      }

      await this.paymentRepository.save(payment);
      return Result.ok(mapPaymentToDto(payment));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm payment';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CONFIRM_PAYMENT_FAILED';
      return Result.fail(new PaymentApplicationError(message, code));
    }
  }
}
