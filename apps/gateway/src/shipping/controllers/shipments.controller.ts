import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
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
import { CalculateShippingHandler } from '../../../../../modules/shipping/application/handlers/calculate-shipping.handler';
import { CreateShipmentHandler } from '../../../../../modules/shipping/application/handlers/create-shipment.handler';
import { DispatchShipmentHandler } from '../../../../../modules/shipping/application/handlers/dispatch-shipment.handler';
import { TrackShipmentHandler } from '../../../../../modules/shipping/application/handlers/track-shipment.handler';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { CalculateShippingRequestDto } from '../dto/calculate-shipping-request.dto';
import { CreateShipmentRequestDto } from '../dto/create-shipment-request.dto';
import { DispatchShipmentRequestDto } from '../dto/dispatch-shipment-request.dto';
import { ShipmentEnvelopeDto, ShippingQuoteEnvelopeDto } from '../dto/shipping-response.dto';
import { mapShippingResult } from '../utils/map-shipping-result';

@ApiTags('shipping')
@ApiBearerAuth('bearer')
@Controller('shipping')
export class ShipmentsController {
  constructor(
    private readonly calculateShippingHandler: CalculateShippingHandler,
    private readonly createShipmentHandler: CreateShipmentHandler,
    private readonly trackShipmentHandler: TrackShipmentHandler,
    private readonly dispatchShipmentHandler: DispatchShipmentHandler,
  ) {}

  @Post('quotes')
  @RequirePermissions('shipping:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate shipping quote', description: 'Returns a shipping cost quote for the given method and destination.' })
  @ApiOkResponse({ type: ShippingQuoteEnvelopeDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async calculateShipping(@Body() body: CalculateShippingRequestDto) {
    const result = await this.calculateShippingHandler.execute(body);
    return mapShippingResult(result);
  }

  @Post('shipments')
  @RequirePermissions('shipping:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create shipment', description: 'Creates a shipment for an order with destination and line items.' })
  @ApiCreatedResponse({ type: ShipmentEnvelopeDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async createShipment(@Body() body: CreateShipmentRequestDto) {
    const result = await this.createShipmentHandler.execute(body);
    return mapShippingResult(result, HttpStatus.CREATED);
  }

  @Get('shipments/:shipmentId')
  @RequirePermissions('shipping:read')
  @ApiOperation({ summary: 'Track shipment by id', description: 'Returns shipment status and tracking history.' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiOkResponse({ type: ShipmentEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async trackShipmentById(@Param('shipmentId') shipmentId: string) {
    const result = await this.trackShipmentHandler.executeById({ shipmentId });
    return mapShippingResult(result);
  }

  @Get('track/:trackingNumber')
  @RequirePermissions('shipping:read')
  @ApiOperation({ summary: 'Track shipment by tracking number', description: 'Returns shipment status and tracking history.' })
  @ApiParam({ name: 'trackingNumber', description: 'Carrier tracking number' })
  @ApiOkResponse({ type: ShipmentEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async trackShipmentByNumber(@Param('trackingNumber') trackingNumber: string) {
    const result = await this.trackShipmentHandler.executeByTrackingNumber({ trackingNumber });
    return mapShippingResult(result);
  }

  @Post('shipments/:shipmentId/dispatch')
  @RequirePermissions('shipping:write')
  @ApiOperation({ summary: 'Dispatch shipment', description: 'Assigns a tracking number and marks the shipment as dispatched.' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiCreatedResponse({ type: ShipmentEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async dispatchShipment(@Param('shipmentId') shipmentId: string, @Body() body: DispatchShipmentRequestDto) {
    const result = await this.dispatchShipmentHandler.execute({
      shipmentId,
      trackingNumber: body.trackingNumber,
    });
    return mapShippingResult(result);
  }
}
