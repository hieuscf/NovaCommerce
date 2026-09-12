import { Result } from '@novacommerce/building-blocks';
import type { IShipmentRepository } from '../../domain/repositories/i-shipment-repository';
import { TrackingNumber } from '../../domain/value-objects/tracking-number';
import type { ShipmentResponseDto } from '../dto/shipping-response.dto';
import { ShippingApplicationError } from '../errors/shipping-application.error';
import { mapShipmentToDto } from '../mappers/map-shipment-to-dto';

export interface DispatchShipmentCommand {
  readonly shipmentId: string;
  readonly trackingNumber: string;
}

export class DispatchShipmentHandler {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(
    command: DispatchShipmentCommand,
  ): Promise<Result<ShipmentResponseDto, ShippingApplicationError>> {
    try {
      const shipment = await this.shipmentRepository.findById(command.shipmentId);
      if (!shipment) {
        return Result.fail(new ShippingApplicationError('Shipment not found', 'SHIPMENT_NOT_FOUND'));
      }

      const trackingNumber = TrackingNumber.create(command.trackingNumber);
      const dispatchResult = shipment.dispatch(trackingNumber);
      if (dispatchResult.isFailure) {
        return Result.fail(
          new ShippingApplicationError(dispatchResult.getError().message, dispatchResult.getError().code),
        );
      }

      await this.shipmentRepository.save(shipment);
      return Result.ok(mapShipmentToDto(shipment));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to dispatch shipment';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'DISPATCH_SHIPMENT_FAILED';
      return Result.fail(new ShippingApplicationError(message, code));
    }
  }
}
