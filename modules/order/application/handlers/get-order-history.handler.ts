import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { OrderStatus } from '../../domain/aggregates/order';
import type { IOrderRepository } from '../../domain/repositories/i-order-repository';
import type { OrderListResponseDto } from '../dto/order-response.dto';
import { OrderApplicationError } from '../errors/order-application.error';
import { mapOrderListToDto } from '../mappers/map-order-to-dto';

export interface GetOrderHistoryQuery {
  readonly identityId: string;
  readonly status?: OrderStatus;
  readonly page?: number;
  readonly pageSize?: number;
}

export class GetOrderHistoryHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetOrderHistoryQuery): Promise<Result<OrderListResponseDto, OrderApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(query.identityId);
      if (!user) {
        return Result.fail(new OrderApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const page = query.page && query.page > 0 ? query.page : 1;
      const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;

      const result = await this.orderRepository.listByCustomerId(user.id, {
        status: query.status,
        page,
        pageSize,
      });

      return Result.ok(mapOrderListToDto(result.items, result.total, page, pageSize));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get order history';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'GET_ORDER_HISTORY_FAILED';
      return Result.fail(new OrderApplicationError(message, code));
    }
  }
}
