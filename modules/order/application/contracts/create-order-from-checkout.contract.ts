import type { Result } from '@novacommerce/building-blocks';
import type { OrderApplicationError } from '../errors/order-application.error';

export interface CreateOrderFromCheckoutLine {
  readonly productId: string;
  readonly variantId?: string;
  readonly sku: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
  readonly warehouseId: string;
}

export interface CreateOrderFromCheckoutCommand {
  readonly customerId: string;
  readonly totalAmount: number;
  readonly totalCurrency: string;
  readonly lines: readonly CreateOrderFromCheckoutLine[];
}

export interface CreateOrderFromCheckoutResult {
  readonly orderId: string;
  readonly orderNumber: string;
}

export interface ICreateOrderFromCheckoutService {
  execute(
    command: CreateOrderFromCheckoutCommand,
  ): Promise<Result<CreateOrderFromCheckoutResult, OrderApplicationError>>;
}
