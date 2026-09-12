import { Result } from '@novacommerce/building-blocks';
import type { IPaymentRepository } from '../../domain/repositories/i-payment-repository';
import { Money } from '../../domain/value-objects/money';
import type { PaymentResponseDto } from '../dto/payment-response.dto';
import { PaymentApplicationError } from '../errors/payment-application.error';
import { mapPaymentToDto } from '../mappers/map-payment-to-dto';

export interface RefundPaymentCommand {
  readonly paymentId: string;
  readonly amount?: number;
}

export class RefundPaymentHandler {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(
    command: RefundPaymentCommand,
  ): Promise<Result<PaymentResponseDto, PaymentApplicationError>> {
    try {
      const payment = await this.paymentRepository.findById(command.paymentId);
      if (!payment) {
        return Result.fail(new PaymentApplicationError('Payment not found', 'PAYMENT_NOT_FOUND'));
      }

      const refundAmount = Money.create(
        command.amount ?? payment.getAmount().amount,
        payment.getAmount().currency,
      );

      const refundResult = payment.refund(refundAmount);
      if (refundResult.isFailure) {
        return Result.fail(
          new PaymentApplicationError(refundResult.getError().message, refundResult.getError().code),
        );
      }

      await this.paymentRepository.save(payment);
      return Result.ok(mapPaymentToDto(payment));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refund payment';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'REFUND_PAYMENT_FAILED';
      return Result.fail(new PaymentApplicationError(message, code));
    }
  }
}
