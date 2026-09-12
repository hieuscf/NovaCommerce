import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { Payment } from '../../domain/aggregates/payment';
import type { IPaymentRepository } from '../../domain/repositories/i-payment-repository';
import { Money } from '../../domain/value-objects/money';
import { PaymentMethod } from '../../domain/value-objects/payment-method';
import { PaymentReference } from '../../domain/value-objects/payment-reference';
import type { IPaymentProvider } from '../contracts/i-payment-provider';
import type { PaymentProvider } from '../contracts/payment-provider.contract';
import type { PaymentInitiationResponseDto } from '../dto/payment-response.dto';
import { PaymentApplicationError } from '../errors/payment-application.error';
import { mapPaymentInitiationToDto } from '../mappers/map-payment-to-dto';

export interface InitiatePaymentCommand {
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly provider: PaymentProvider;
  readonly customerId: string;
}

function generatePaymentReference(): string {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `PAY-${suffix}`;
}

export class InitiatePaymentHandler {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    command: InitiatePaymentCommand,
  ): Promise<Result<PaymentInitiationResponseDto, PaymentApplicationError>> {
    try {
      const paymentId = randomUUID();
      const attemptId = randomUUID();
      const reference = PaymentReference.create(generatePaymentReference());
      const amount = Money.create(command.amount, command.currency);
      const method = PaymentMethod.create(command.provider);

      const initiateResult = Payment.initiate(
        paymentId,
        reference,
        command.orderId,
        amount,
        method,
        attemptId,
      );

      if (initiateResult.isFailure) {
        return Result.fail(
          new PaymentApplicationError(initiateResult.getError().message, initiateResult.getError().code),
        );
      }

      const payment = initiateResult.getValue();

      const providerResult = await this.paymentProvider.createIntent({
        paymentId: payment.id,
        orderId: command.orderId,
        amount: command.amount,
        currency: amount.currency,
        provider: command.provider,
        customerId: command.customerId,
      });

      if (providerResult.isFailure) {
        return Result.fail(providerResult.getError());
      }

      await this.paymentRepository.save(payment);

      const providerResponse = providerResult.getValue();

      return Result.ok(
        mapPaymentInitiationToDto(payment, command.provider, providerResponse.redirectUrl),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate payment';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'INITIATE_PAYMENT_FAILED';
      return Result.fail(new PaymentApplicationError(message, code));
    }
  }
}
