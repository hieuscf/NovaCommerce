import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AdjustStockHandler } from '../../../../../modules/inventory/application/handlers/adjust-stock.handler';
import { CreateInventoryItemHandler } from '../../../../../modules/inventory/application/handlers/create-inventory-item.handler';
import { ReleaseStockByOrderHandler } from '../../../../../modules/inventory/application/handlers/release-stock-by-order.handler';
import { ReleaseStockHandler } from '../../../../../modules/inventory/application/handlers/release-stock.handler';
import { ReserveStockHandler } from '../../../../../modules/inventory/application/handlers/reserve-stock.handler';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { AdjustStockRequestDto } from '../dto/adjust-stock-request.dto';
import { CreateInventoryItemRequestDto } from '../dto/create-inventory-item-request.dto';
import {
  InventoryItemEnvelopeDto,
  ReleaseStockByOrderEnvelopeDto,
} from '../dto/inventory-item-response.dto';
import { ReleaseStockRequestDto } from '../dto/release-stock-request.dto';
import { ReserveStockRequestDto } from '../dto/reserve-stock-request.dto';
import { mapInventoryResult } from '../utils/map-inventory-result';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly createInventoryItemHandler: CreateInventoryItemHandler,
    private readonly adjustStockHandler: AdjustStockHandler,
    private readonly reserveStockHandler: ReserveStockHandler,
    private readonly releaseStockHandler: ReleaseStockHandler,
    private readonly releaseStockByOrderHandler: ReleaseStockByOrderHandler,
  ) {}

  @Post('items')
  @RequirePermissions('inventory:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create inventory item', description: 'Creates stock for a SKU in a warehouse.' })
  @ApiCreatedResponse({ type: InventoryItemEnvelopeDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async createItem(@Body() body: CreateInventoryItemRequestDto) {
    const result = await this.createInventoryItemHandler.execute(body);
    return mapInventoryResult(result, HttpStatus.CREATED);
  }

  @Post('items/:id/adjust')
  @RequirePermissions('inventory:write')
  @ApiOperation({ summary: 'Adjust stock', description: 'Applies a signed stock adjustment to an inventory item.' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiOkResponse({ type: InventoryItemEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async adjustStock(@Param('id') id: string, @Body() body: AdjustStockRequestDto) {
    const result = await this.adjustStockHandler.execute({
      inventoryItemId: id,
      delta: body.delta,
      reason: body.reason,
    });
    return mapInventoryResult(result);
  }

  @Post('reservations')
  @RequirePermissions('inventory:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reserve stock', description: 'Reserves stock for an order line.' })
  @ApiCreatedResponse({ type: InventoryItemEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async reserveStock(@Body() body: ReserveStockRequestDto) {
    const result = await this.reserveStockHandler.execute(body);
    return mapInventoryResult(result, HttpStatus.CREATED);
  }

  @Post('items/:id/release')
  @RequirePermissions('inventory:write')
  @ApiOperation({ summary: 'Release stock reservation', description: 'Releases an active reservation on an inventory item.' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiOkResponse({ type: InventoryItemEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async releaseStock(@Param('id') id: string, @Body() body: ReleaseStockRequestDto) {
    const result = await this.releaseStockHandler.execute({
      inventoryItemId: id,
      reservationId: body.reservationId,
    });
    return mapInventoryResult(result);
  }

  @Post('orders/:orderId/release')
  @RequirePermissions('inventory:write')
  @ApiOperation({ summary: 'Release order reservations', description: 'Releases all active reservations for an order.' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiOkResponse({ type: ReleaseStockByOrderEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async releaseStockByOrder(@Param('orderId') orderId: string) {
    const result = await this.releaseStockByOrderHandler.execute({ orderId });
    return mapInventoryResult(result);
  }
}
