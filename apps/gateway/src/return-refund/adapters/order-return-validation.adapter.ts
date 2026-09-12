import { Result } from '@novacommerce/building-blocks';
import { OrderStatus } from '../../../../../modules/order/domain/aggregates/order';
import type { IOrderRepository } from '../../../../../modules/order/domain/repositories/i-order-repository';
import { OrderId } from '../../../../../modules/order/domain/value-objects/order-id';
import { PaymentStatus } from '../../../../../modules/payment/domain/aggregates/payment';
import type { IPaymentRepository } from '../../../../../modules/payment/domain/repositories/i-payment-repository';
import type {
  IOrderReturnValidationService,
  OrderReturnValidationRequest,
  OrderReturnValidationResult,
} from '../../../../../modules/return-refund/application/contracts/i-order-return-validation.contract';
import { ReturnRefundApplicationError } from '../../../../../modules/return-refund/application/errors/return-refund-application.error';

export class OrderReturnValidationAdapter implements IOrderReturnValidationService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async validate(
    request: OrderReturnValidationRequest,
  ): Promise<Result<OrderReturnValidationResult, ReturnRefundApplicationError>> {
    try {
      const order = await this.orderRepository.findById(OrderId.create(request.orderId));
      if (!order) {
        return Result.fail(new ReturnRefundApplicationError('Order not found', 'ORDER_NOT_FOUND'));
      }

      if (order.getCustomerId() !== request.customerId) {
        return Result.fail(new ReturnRefundApplicationError('Order not found', 'ORDER_NOT_FOUND'));
      }

      if (order.getStatus() !== OrderStatus.COMPLETED) {
        return Result.fail(
          new ReturnRefundApplicationError('Only completed orders are eligible for return', 'ORDER_NOT_RETURNABLE'),
        );
      }

      const payment = await this.paymentRepository.findByOrderId(order.id);
      if (!payment) {
        return Result.fail(new ReturnRefundApplicationError('Payment not found for order', 'PAYMENT_NOT_FOUND'));
      }

      if (payment.getStatus() !== PaymentStatus.SUCCEEDED) {
        return Result.fail(
          new ReturnRefundApplicationError('Payment must be succeeded before return', 'PAYMENT_NOT_REFUNDABLE'),
        );
      }

      const total = order.getTotal();
      return Result.ok({
        orderId: order.id,
        customerId: order.getCustomerId(),
        paymentId: payment.id,
        refundAmount: total.amount,
        currency: total.currency,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate order for return';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'ORDER_RETURN_VALIDATION_FAILED';
      return Result.fail(new ReturnRefundApplicationError(message, code));
    }
  }
}
