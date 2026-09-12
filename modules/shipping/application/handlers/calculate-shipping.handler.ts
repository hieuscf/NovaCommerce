import { Result } from '@novacommerce/building-blocks';
import { ShippingMethod } from '../../domain/value-objects/shipping-method';
import type { IShippingProvider } from '../contracts/i-shipping-provider';
import type { ShippingQuoteResponseDto } from '../dto/shipping-response.dto';
import { ShippingApplicationError } from '../errors/shipping-application.error';

export interface CalculateShippingCommand {
  readonly methodCode: string;
  readonly methodName?: string;
  readonly destinationCountry: string;
  readonly itemCount: number;
  readonly currency: string;
}

export class CalculateShippingHandler {
  constructor(private readonly shippingProvider: IShippingProvider) {}

  async execute(
    command: CalculateShippingCommand,
  ): Promise<Result<ShippingQuoteResponseDto, ShippingApplicationError>> {
    try {
      if (!command.destinationCountry?.trim()) {
        return Result.fail(new ShippingApplicationError('Destination country is required', 'INVALID_DESTINATION'));
      }
      if (!Number.isInteger(command.itemCount) || command.itemCount <= 0) {
        return Result.fail(new ShippingApplicationError('Item count must be positive', 'INVALID_ITEM_COUNT'));
      }

      const method = ShippingMethod.create(command.methodCode, command.methodName);

      const quoteResult = await this.shippingProvider.calculateQuote({
        methodCode: method.code,
        destinationCountry: command.destinationCountry.trim().toUpperCase(),
        itemCount: command.itemCount,
        currency: command.currency,
      });

      if (quoteResult.isFailure) {
        return Result.fail(quoteResult.getError());
      }

      const quote = quoteResult.getValue();

      return Result.ok({
        methodCode: method.code,
        methodName: method.name,
        amount: quote.amount,
        currency: quote.currency,
        estimatedDays: quote.estimatedDays,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to calculate shipping';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CALCULATE_SHIPPING_FAILED';
      return Result.fail(new ShippingApplicationError(message, code));
    }
  }
}
