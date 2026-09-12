import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { CancelOrderHandler } from '../../../../../modules/order/application/handlers/cancel-order.handler';
import { GetOrderByIdHandler } from '../../../../../modules/order/application/handlers/get-order-by-id.handler';
import { GetOrderHistoryHandler } from '../../../../../modules/order/application/handlers/get-order-history.handler';
import { OrderStatus } from '../../../../../modules/order/domain/aggregates/order';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { OrderHistoryQueryDto } from '../dto/order-history-query.dto';
import { OrderEnvelopeDto, OrderListEnvelopeDto } from '../dto/order-response.dto';
import { mapOrderResult } from '../utils/map-order-result';

@ApiTags('orders')
@ApiBearerAuth('bearer')
@Controller('users/me/orders')
export class OrdersController {
  constructor(
    private readonly getOrderHistoryHandler: GetOrderHistoryHandler,
    private readonly getOrderByIdHandler: GetOrderByIdHandler,
    private readonly cancelOrderHandler: CancelOrderHandler,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get order history',
    description: 'Returns paginated orders for the authenticated customer, newest first.',
  })
  @ApiOkResponse({ type: OrderListEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getOrderHistory(@CurrentUser() user: SecurityContext, @Query() query: OrderHistoryQueryDto) {
    const result = await this.getOrderHistoryHandler.execute({
      identityId: user.userId,
      status: query.status as OrderStatus | undefined,
      page: query.page,
      pageSize: query.pageSize,
    });
    return mapOrderResult(result);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order by id', description: 'Returns a single order owned by the authenticated customer.' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiOkResponse({ type: OrderEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getOrderById(@CurrentUser() user: SecurityContext, @Param('orderId') orderId: string) {
    const result = await this.getOrderByIdHandler.execute({
      identityId: user.userId,
      orderId,
    });
    return mapOrderResult(result);
  }

  @Post(':orderId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order', description: 'Cancels a pending or confirmed order owned by the customer.' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiOkResponse({ type: OrderEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async cancelOrder(@CurrentUser() user: SecurityContext, @Param('orderId') orderId: string) {
    const result = await this.cancelOrderHandler.execute({
      identityId: user.userId,
      orderId,
    });
    return mapOrderResult(result);
  }
}
