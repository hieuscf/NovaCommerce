import { Result } from '@novacommerce/building-blocks';
import type { IPaymentRepository } from '../../domain/repositories/i-payment-repository';
import type { PaymentResponseDto } from '../dto/payment-response.dto';
import { PaymentApplicationError } from '../errors/payment-application.error';
import { mapPaymentToDto } from '../mappers/map-payment-to-dto';

export interface FailPaymentCommand {
  readonly paymentId: string;
  readonly reason: string;
}

export class FailPaymentHandler {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(
    command: FailPaymentCommand,
  ): Promise<Result<PaymentResponseDto, PaymentApplicationError>> {
    try {
      const payment = await this.paymentRepository.findById(command.paymentId);
      if (!payment) {
        return Result.fail(new PaymentApplicationError('Payment not found', 'PAYMENT_NOT_FOUND'));
      }

      const failResult = payment.markFailed(command.reason);
      if (failResult.isFailure) {
        return Result.fail(
          new PaymentApplicationError(failResult.getError().message, failResult.getError().code),
        );
      }

      await this.paymentRepository.save(payment);
      return Result.ok(mapPaymentToDto(payment));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record payment failure';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'FAIL_PAYMENT_FAILED';
      return Result.fail(new PaymentApplicationError(message, code));
    }
  }
}
