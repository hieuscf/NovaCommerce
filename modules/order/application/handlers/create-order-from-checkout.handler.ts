import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { Order } from '../../domain/aggregates/order';
import type { IOrderRepository } from '../../domain/repositories/i-order-repository';
import { Money } from '../../domain/value-objects/money';
import { OrderId } from '../../domain/value-objects/order-id';
import { OrderNumber } from '../../domain/value-objects/order-number';
import { Quantity } from '../../domain/value-objects/quantity';
import type {
  CreateOrderFromCheckoutCommand,
  CreateOrderFromCheckoutResult,
  ICreateOrderFromCheckoutService,
} from '../contracts/create-order-from-checkout.contract';
import { OrderApplicationError } from '../errors/order-application.error';

function generateOrderNumber(): string {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `ORD-${suffix}`;
}

export class CreateOrderFromCheckoutHandler implements ICreateOrderFromCheckoutService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(
    command: CreateOrderFromCheckoutCommand,
  ): Promise<Result<CreateOrderFromCheckoutResult, OrderApplicationError>> {
    try {
      if (command.lines.length === 0) {
        return Result.fail(new OrderApplicationError('Order must have lines', 'ORDER_NO_LINES'));
      }

      const orderId = OrderId.create(randomUUID());
      const orderNumber = OrderNumber.create(generateOrderNumber());
      const total = Money.create(command.totalAmount, command.totalCurrency);

      const orderResult = Order.createFromCheckout({
        id: orderId,
        orderNumber,
        customerId: command.customerId,
        total,
        lines: command.lines.map((line) => ({
          lineId: randomUUID(),
          productId: line.productId,
          variantId: line.variantId,
          quantity: Quantity.create(line.quantity),
          unitPrice: Money.create(line.unitPriceAmount, line.unitPriceCurrency),
          sku: line.sku,
          warehouseId: line.warehouseId,
        })),
      });

      if (orderResult.isFailure) {
        return Result.fail(
          new OrderApplicationError(orderResult.getError().message, orderResult.getError().code),
        );
      }

      const order = orderResult.getValue();
      await this.orderRepository.save(order);

      return Result.ok({
        orderId: order.id,
        orderNumber: order.getOrderNumber().value,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order from checkout';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CREATE_ORDER_FAILED';
      return Result.fail(new OrderApplicationError(message, code));
    }
  }
}
