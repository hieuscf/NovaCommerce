import { Result } from '@novacommerce/building-blocks';
import type { IShipmentRepository } from '../../domain/repositories/i-shipment-repository';
import { TrackingNumber } from '../../domain/value-objects/tracking-number';
import type { ShipmentResponseDto } from '../dto/shipping-response.dto';
import { ShippingApplicationError } from '../errors/shipping-application.error';
import { mapShipmentToDto } from '../mappers/map-shipment-to-dto';

export interface TrackShipmentByIdCommand {
  readonly shipmentId: string;
}

export interface TrackShipmentByTrackingNumberCommand {
  readonly trackingNumber: string;
}

export class TrackShipmentHandler {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async executeById(
    command: TrackShipmentByIdCommand,
  ): Promise<Result<ShipmentResponseDto, ShippingApplicationError>> {
    try {
      const shipment = await this.shipmentRepository.findById(command.shipmentId);
      if (!shipment) {
        return Result.fail(new ShippingApplicationError('Shipment not found', 'SHIPMENT_NOT_FOUND'));
      }
      return Result.ok(mapShipmentToDto(shipment));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to track shipment';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'TRACK_SHIPMENT_FAILED';
      return Result.fail(new ShippingApplicationError(message, code));
    }
  }

  async executeByTrackingNumber(
    command: TrackShipmentByTrackingNumberCommand,
  ): Promise<Result<ShipmentResponseDto, ShippingApplicationError>> {
    try {
      const trackingNumber = TrackingNumber.create(command.trackingNumber);
      const shipment = await this.shipmentRepository.findByTrackingNumber(trackingNumber);
      if (!shipment) {
        return Result.fail(new ShippingApplicationError('Shipment not found', 'SHIPMENT_NOT_FOUND'));
      }
      return Result.ok(mapShipmentToDto(shipment));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to track shipment';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'TRACK_SHIPMENT_FAILED';
      return Result.fail(new ShippingApplicationError(message, code));
    }
  }
}
