import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { Shipment } from '../../domain/aggregates/shipment';
import { ShipmentItem } from '../../domain/entities/shipment-item';
import type { IShipmentRepository } from '../../domain/repositories/i-shipment-repository';
import { Address } from '../../domain/value-objects/address';
import { CarrierCode } from '../../domain/value-objects/carrier-code';
import type { ShipmentResponseDto } from '../dto/shipping-response.dto';
import { ShippingApplicationError } from '../errors/shipping-application.error';
import { mapShipmentToDto } from '../mappers/map-shipment-to-dto';

export interface CreateShipmentItemCommand {
  readonly orderLineId: string;
  readonly quantity: number;
}

export interface CreateShipmentCommand {
  readonly orderId: string;
  readonly carrierCode: string;
  readonly destination: {
    readonly line1: string;
    readonly line2?: string;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
    readonly country: string;
  };
  readonly items: readonly CreateShipmentItemCommand[];
}

export class CreateShipmentHandler {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(
    command: CreateShipmentCommand,
  ): Promise<Result<ShipmentResponseDto, ShippingApplicationError>> {
    try {
      if (!command.items.length) {
        return Result.fail(new ShippingApplicationError('At least one shipment item is required', 'SHIPMENT_ITEMS_REQUIRED'));
      }

      const existing = await this.shipmentRepository.findByOrderId(command.orderId);
      if (existing) {
        return Result.fail(new ShippingApplicationError('Shipment already exists for order', 'SHIPMENT_ALREADY_EXISTS'));
      }

      const shipmentId = randomUUID();
      const carrierCode = CarrierCode.create(command.carrierCode);
      const destination = Address.create(command.destination);

      const createResult = Shipment.create(shipmentId, command.orderId, carrierCode, destination);
      if (createResult.isFailure) {
        return Result.fail(
          new ShippingApplicationError(createResult.getError().message, createResult.getError().code),
        );
      }

      const shipment = createResult.getValue();

      for (const item of command.items) {
        if (!item.orderLineId?.trim()) {
          return Result.fail(new ShippingApplicationError('Order line id is required', 'INVALID_ORDER_LINE_ID'));
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          return Result.fail(new ShippingApplicationError('Item quantity must be positive', 'INVALID_ITEM_QUANTITY'));
        }
        shipment.addItem(ShipmentItem.create(randomUUID(), item.orderLineId.trim(), item.quantity));
      }

      await this.shipmentRepository.save(shipment);
      return Result.ok(mapShipmentToDto(shipment));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create shipment';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CREATE_SHIPMENT_FAILED';
      return Result.fail(new ShippingApplicationError(message, code));
    }
  }
}
