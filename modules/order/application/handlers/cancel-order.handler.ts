import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { IOrderRepository } from '../../domain/repositories/i-order-repository';
import { OrderId } from '../../domain/value-objects/order-id';
import type { OrderResponseDto } from '../dto/order-response.dto';
import { OrderApplicationError } from '../errors/order-application.error';
import { mapOrderToDto } from '../mappers/map-order-to-dto';

export interface CancelOrderCommand {
  readonly identityId: string;
  readonly orderId: string;
}

export class CancelOrderHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: CancelOrderCommand): Promise<Result<OrderResponseDto, OrderApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new OrderApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const order = await this.orderRepository.findById(OrderId.create(command.orderId));
      if (!order) {
        return Result.fail(new OrderApplicationError('Order not found', 'ORDER_NOT_FOUND'));
      }

      if (order.getCustomerId() !== user.id) {
        return Result.fail(new OrderApplicationError('Order not found', 'ORDER_NOT_FOUND'));
      }

      const cancelResult = order.cancel();
      if (cancelResult.isFailure) {
        return Result.fail(
          new OrderApplicationError(cancelResult.getError().message, cancelResult.getError().code),
        );
      }

      await this.orderRepository.save(order);

      return Result.ok(mapOrderToDto(order));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel order';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'CANCEL_ORDER_FAILED';
      return Result.fail(new OrderApplicationError(message, code));
    }
  }
}
